import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [PostService, PostResolver, UserService],
})
export class PostModule {}
