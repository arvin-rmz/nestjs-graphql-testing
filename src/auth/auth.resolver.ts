import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { LoginInputDTO } from './dto/login.input.dto';
import { SignupInputDTO } from './dto/signup.input.dto';
import { GqlAuthGuard } from './guards/gql-auth-guard';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation('login')
  @UseGuards(GqlAuthGuard)
  login(@Args('loginInput') _: LoginInputDTO, @Context() context) {
    return this.authService.login(context.user);
  }

  @Mutation('signup')
  signup(@Args('signupInput') signupInput: SignupInputDTO) {
    console.log(signupInput, 'resolver');
    return this.authService.signup(signupInput);
  }
}
