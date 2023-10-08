import { PostService } from './post.service';
import { PostCreateInputDTO } from './dto/post-create-input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { CurrentUser } from 'src/user/decorators/current-user.decorator';
import { Post } from 'src/graphql';
import { UserService } from 'src/user/user.service';
import { IJwtPayload } from 'src/auth/strategies/jwt.strategy';
import { DataLoaderService } from 'src/dataloader/dataloader.service';
import { IDataloaders } from 'src/dataloader/dataloader.interface';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

interface IGetUserParent extends Post {
  userId: string;
}

@Resolver('Post')
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
    private readonly dataloaderService: DataLoaderService,
  ) {}

  @Mutation('postCreate')
  @UseGuards(JwtAuthGuard)
  create(
    @Args('postCreateInput') postCreateInput: PostCreateInputDTO,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const currentUserId = Number(currentUser.sub);

    return this.postService.create(postCreateInput, currentUserId);
  }

  @Query('post')
  findOne(@Args('id') id: string) {
    return this.postService.findOne(Number(id));
  }

  @Query('posts')
  findAll() {
    return this.postService.findAll();
  }

  @ResolveField('user')
  getUser(
    @Parent() { userId }: IGetUserParent,
    @Context() { loaders }: { loaders: IDataloaders },
  ) {
    return loaders.userLoader.load(Number(userId));
  }
}
