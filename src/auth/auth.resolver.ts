import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInputDTO } from './dto/login.input.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth-guard';
import { SignupInputDTO } from './dto/signup.input.dto';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation('login')
  @UseGuards(GqlAuthGuard)
  login(@Args('loginInput') loginInput: LoginInputDTO) {
    return this.authService.login(loginInput);
  }

  @Mutation('signup')
  @UseGuards(GqlAuthGuard)
  signup(@Args('signupInput') signupInput: SignupInputDTO) {
    return this.authService.signup(signupInput);
  }
}
