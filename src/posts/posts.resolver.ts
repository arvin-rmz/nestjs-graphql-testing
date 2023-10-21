import { UseGuards } from '@nestjs/common';
import { Post } from 'prisma/prisma-client';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { PostsService } from './posts.service';
import { PostCreateInputDTO } from './dto/post-create-input';
import { AtAuthGuard } from 'src/auth/guards/at-auth-guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { IJwtUserPayload } from 'src/auth/strategies/at-jwt.strategy';
import { IDataloaders } from 'src/dataloader/dataloader.interface';

@Resolver('Post')
export class PostsResolver {
  constructor(private readonly postService: PostsService) {}

  @Mutation('postCreate')
  @UseGuards(AtAuthGuard)
  createPost(
    @Args('postCreateInput') postCreateInput: PostCreateInputDTO,
    @CurrentUser() currentUser: IJwtUserPayload,
  ) {
    const currentUserId = Number(currentUser.sub);

    return this.postService.create(postCreateInput, currentUserId);
  }

  @Query('post')
  getPost(@Args('id') id: string) {
    return this.postService.findOne(Number(id));
  }

  @Query('posts')
  getAllPosts() {
    return this.postService.findAll();
  }

  @ResolveField('user')
  getUser(
    @Parent() { userId }: Post,
    @Context() { loaders }: { loaders: IDataloaders },
  ) {
    return loaders.userLoader.load(Number(userId));
  }
}
