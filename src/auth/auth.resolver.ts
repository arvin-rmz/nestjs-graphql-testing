import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { LoginInputDTO } from './dto/login.input.dto';
import { SignupInputDTO } from './dto/signup.input.dto';
import { GqlAuthGuard } from './guards/gql-auth-guard';
import { RedisService } from 'src/redis/redis.service';
import { RtAuthGuard } from './guards/rt-auth-guard';
import { AtAuthGuard } from './guards/at-auth-guard';

@Resolver('Auth')
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private redisService: RedisService,
  ) {}

  @Mutation('login')
  @UseGuards(GqlAuthGuard)
  async login(@Args('loginInput') _: LoginInputDTO, @Context() context) {
    console.log(context.user, 'login');
    return this.authService.login(context.user);
  }

  @Mutation('signup')
  signup(@Args('signupInput') signupInput: SignupInputDTO) {
    return this.authService.signup(signupInput);
  }

  @Mutation('refresh')
  @UseGuards(RtAuthGuard)
  refresh(@Context() context) {
    const user = context.req.user;
    return this.authService.refresh(user);
  }

  @Mutation('logout')
  @UseGuards(AtAuthGuard)
  logout(@Context() context) {
    const decodedUser = context.req.user;
    return this.authService.logout(decodedUser);
  }
}
