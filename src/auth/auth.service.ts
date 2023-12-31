import { Injectable } from '@nestjs/common';
import { AuthPayload } from 'src/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'prisma/prisma-client';
import * as bcrypt from 'bcrypt';

import { SignupInputDTO } from './dto/signup.input.dto';
import { UsersService } from 'src/users/users.service';
import { BadRequestError } from 'src/errors/bad-request.error';
import { RedisService } from 'src/redis/redis.service';
import { IJwtUserPayload } from './strategies/at-jwt.strategy';
import { ForbiddenError } from 'src/errors/forbidden.error';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new BadRequestError('Invalid email or password');

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) throw new BadRequestError('Invalid email or password');

    const { password: passwordToExtract, ...userWithoutPassword } = user;

    return userWithoutPassword;

    return null;
  }

  async signup({
    email,
    password: enteredPassword,
    firstName,
    lastName,
  }: SignupInputDTO): Promise<any> {
    const hashedPassword = await bcrypt.hash(enteredPassword, 12);

    // User.email is set to unique, and an error will be thrown if a user already exists through userService.create().
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    const { password, ...userWithoutPassword } = user;

    const { accessToken, refreshToken } = await this.generateAuthTokens({
      email: user.email,
      sub: user.id,
    });

    await this.redisService.setItem(user.id.toString(), refreshToken);

    return {
      userErrors: [],
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async login(user: Omit<User, 'password'>): Promise<any> {
    const { accessToken, refreshToken } = await this.generateAuthTokens({
      email: user.email,
      sub: user.id,
    });

    await this.redisService.setItem(user.id.toString(), refreshToken);

    return {
      userErrors: [],
      accessToken,
      refreshToken,

      user,
    };
  }

  async logout(user: IJwtUserPayload) {
    const result = await this.redisService.removeItem(user.sub.toString());

    if (!result) {
      throw new BadRequestError('User is not logged in');
    }

    return 'Logged out successfully.';
  }

  async refresh(
    user: IJwtUserPayload,
    currentRefreshToken: string,
  ): Promise<any> {
    const existRefreshToken = await this.redisService.getItem(
      user.sub.toString(),
    );

    if (!existRefreshToken || existRefreshToken !== currentRefreshToken) {
      throw new ForbiddenError('Refresh token is not valid, please try login.');
    }

    const { accessToken, refreshToken } = await this.generateAuthTokens({
      email: user.email,
      sub: user.sub,
    });

    await this.redisService.removeItem(user.sub.toString());

    await this.redisService.setItem(user.sub.toString(), refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateAuthTokens(payload: {
    email: string;
    sub: number;
  }): Promise<any> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET_KEY'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET_KEY'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
