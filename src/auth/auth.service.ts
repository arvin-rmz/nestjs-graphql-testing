import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayload } from 'src/graphql';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/prisma/prisma.service';
import { LoginInputDTO } from './dto/login.input.dto';
import { SignupInputDTO } from './dto/signup.input.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prismaService.user.findFirst({ where: { email } });
    if (!user) return null;

    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
      const { password, ...result } = user;

      return result;
    }

    return null;
  }

  async login(loginInput: LoginInputDTO): Promise<AuthPayload> {
    const user = await this.validateUser(loginInput.email, loginInput.password);

    if (!user) throw new UnauthorizedException('Invalid email or password');

    const jwt = this.jwtService.sign({ email: user.email, sub: user.id });
    return {
      userErrors: [],
      tokens: {
        accessToken: jwt,
      },
      user,
    } as unknown as AuthPayload;
  }

  async signup({
    email,
    password,
    firstName,
    lastName,
  }: SignupInputDTO): Promise<AuthPayload> {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.userService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    const accessToken = this.jwtService.sign({
      email: user.email,
      sub: user.id,
    });

    return {
      userErrors: [],
      user: user as unknown as AuthPayload['user'],
      tokens: {
        accessToken,
      },
    };
  }
}
