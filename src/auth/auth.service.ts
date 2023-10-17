import { Injectable } from '@nestjs/common';
import { AuthPayload } from 'src/graphql';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { SignupInputDTO } from './dto/signup.input.dto';
import { UserService } from 'src/user/user.service';
import { BadRequestError } from 'src/errors/bad-request.error';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new BadRequestError('Invalid email or password');

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) throw new BadRequestError('Invalid email or password');

    const { password: passwordToExtract, ...userExtractedPassword } = user;

    return userExtractedPassword;

    return null;
  }

  async login(user: any): Promise<any> {
    const jwt = this.jwtService.sign({ email: user.email, sub: user.id });

    return {
      userErrors: [],
      accessToken: jwt,

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

    // User.email is set to unique, and an error will be thrown if a user already exists through userService.create().
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
      accessToken,
    };
  }
}
