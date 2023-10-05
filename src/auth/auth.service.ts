import { Injectable } from '@nestjs/common';
import { LoginPayload } from 'src/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginInputDTO } from './dto/login.input.dto';
import { JwtService } from '@nestjs/jwt';
import { SignupInputDTO } from './dto/signup.input.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) return null;

    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
      const { password, ...result } = user;

      return result;
    }

    return null;
  }

  async login(loginInput: LoginInputDTO): Promise<LoginPayload> {
    const user = await this.validateUser(loginInput.email, loginInput.password);

    const jwt = this.jwtService.sign({ email: user.email, sub: user.id });

    return {
      userErrors: [],
      tokens: {
        accessToken: jwt,
      },
      user,
    };
  }

  async signup({ email, password, firstName, lastName }: SignupInputDTO) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const { user } = await this.userService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    const accessToken = this.jwtService.sign({ email, sub: user.id });

    return {
      userErrors: [],
      user,
      tokens: {
        accessToken,
      },
    };
  }
}
