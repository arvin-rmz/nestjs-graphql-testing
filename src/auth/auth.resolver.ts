import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { LoginInputDTO } from './dto/login.input.dto';
import { SignupInputDTO } from './dto/signup.input.dto';
import { GqlAuthGuard } from './guards/gql-auth-guard';
import { RedisService } from 'src/redis/redis.service';

@Resolver('Auth')
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private redisService: RedisService,
  ) {}

  @Mutation('login')
  @UseGuards(GqlAuthGuard)
  async login(@Args('loginInput') _: LoginInputDTO, @Context() context) {
    return this.authService.login(context.user);
  }

  @Mutation('signup')
  signup(@Args('signupInput') signupInput: SignupInputDTO) {
    return this.authService.signup(signupInput);
  }
}
