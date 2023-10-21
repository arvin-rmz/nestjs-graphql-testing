import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from 'src/graphql';

import { UsersService } from './users.service';
import { FindUserInputDTO } from './dto/find-one-user-input';
import { AtAuthGuard } from 'src/auth/guards/at-auth-guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { PostsService } from 'src/posts/posts.service';
import { IJwtUserPayload } from 'src/auth/strategies/at-jwt.strategy';
import { RedisService } from 'src/redis/redis.service';

@Resolver('User')
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly redisService: RedisService,
  ) {}

  @Query('users')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Query('user')
  getUser(@Args('findUserInput') findUserInput: FindUserInputDTO) {
    return this.usersService.findUOne(Number(findUserInput.id));
  }

  @Query('me')
  @UseGuards(AtAuthGuard)
  me(@CurrentUser() currentUser: IJwtUserPayload) {
    return this.usersService.findUOne(currentUser.sub);
  }

  @ResolveField('posts')
  async getPosts(@Parent() { id }: User) {
    const userId = Number(id);
    const { posts } = await this.postsService.findAllByUserId(userId);

    return posts;
  }
}
