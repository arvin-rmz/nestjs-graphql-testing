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

import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { IJwtUserPayload } from 'src/auth/strategies/at-jwt.strategy';
import { IDataloaders } from 'src/dataloader/dataloader.interface';
import { AtAuthGuard } from 'src/auth/guards/at-auth-guard';
import { PostsService } from './posts.service';
import { PostCreateInputDTO } from './dto/post-create-input';
import { PostCreateFilesInput } from './dto/post-create-files-input';
import { validatePostFiles } from './utils/validate-post-files';

@Resolver('Post')
export class PostsResolver {
  constructor(private readonly postService: PostsService) {}

  @Mutation('postCreate')
  @UseGuards(AtAuthGuard)
  async postCreate(
    @Args('postCreateInput') postCreateInput: PostCreateInputDTO,
    @Args('postCreateInput') { files }: PostCreateFilesInput,
    @CurrentUser() currentUser: IJwtUserPayload,
  ) {
    const currentUserId = Number(currentUser.sub);

    await validatePostFiles(files);

    return this.postService.create(
      { ...postCreateInput, files: files },
      currentUserId,
    );
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

  @ResolveField('files')
  async getPostFiles(
    @Parent() { id }: Post,
    @Context() { loaders }: { loaders: IDataloaders },
  ) {
    // return this.postService.getPostFiles(id);
    return loaders.postFilesLoader.load(id);
  }
}
