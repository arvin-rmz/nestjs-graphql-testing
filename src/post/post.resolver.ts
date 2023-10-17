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

import { PostService } from './post.service';
import { PostCreateInputDTO } from './dto/post-create-input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { CurrentUser } from 'src/user/decorators/current-user.decorator';
import { IJwtPayload } from 'src/auth/strategies/jwt.strategy';
import { IDataloaders } from 'src/dataloader/dataloader.interface';

@Resolver('Post')
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation('postCreate')
  @UseGuards(JwtAuthGuard)
  createPost(
    @Args('postCreateInput') postCreateInput: PostCreateInputDTO,
    @CurrentUser() currentUser: IJwtPayload,
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
