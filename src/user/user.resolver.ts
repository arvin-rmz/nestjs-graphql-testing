import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { FindUserInputDTO } from './dto/find-one-user-input';
import { UserPayload } from 'src/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query('users')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  // @Query('user')
  // @UseGuards(JwtAuthGuard)
  // findOne(@Args('findUserInput') findUserInput: FindUserInputDTO) {
  //   return this.userService.findOne(findUserInput.email);
  // }
}
