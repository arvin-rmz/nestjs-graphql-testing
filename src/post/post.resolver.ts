import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PostService } from './post.service';
import { PostCreateInputDTO } from './dto/post-create-input';

@Resolver('Post')
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation('postCreate')
  create(@Args('postCreateInput') postCreateInput: PostCreateInputDTO) {
    return this.postService.create(postCreateInput);
  }
}
