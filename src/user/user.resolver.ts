import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from 'src/graphql';

import { UserService } from './user.service';
import { FindUserInputDTO } from './dto/find-one-user-input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { PostService } from 'src/post/post.service';
import { IJwtPayload } from 'src/auth/strategies/jwt.strategy';

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  @Query('users')
  getAllUsers() {
    return this.userService.findAll();
  }

  @Query('user')
  getUser(@Args('findUserInput') findUserInput: FindUserInputDTO) {
    return this.userService.findUOne(Number(findUserInput.id));
  }

  @Query('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() currentUser: IJwtPayload) {
    return this.userService.findUOne(currentUser.sub);
  }

  @ResolveField('posts')
  async getPosts(@Parent() { id }: User) {
    const userId = Number(id);
    const { posts } = await this.postService.findAllByUserId(userId);

    return posts;
  }
}
