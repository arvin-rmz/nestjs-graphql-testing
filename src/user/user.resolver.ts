import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserService } from './user.service';
import { FindUserInputDTO } from './dto/find-one-user-input';
import { User, UserPayload } from 'src/graphql';
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
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Query('user')
  findOne(@Args('findUserInput') findUserInput: FindUserInputDTO) {
    return this.userService.findOne(Number(findUserInput.id));
  }

  @Query('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() currentUser: IJwtPayload) {
    return this.userService.findOne(currentUser.sub);
  }

  @ResolveField('posts')
  async getPosts(@Parent() { id }: User) {
    const userId = Number(id);
    const { posts } = await this.postService.findUserPosts(userId);

    return posts;
  }
}
