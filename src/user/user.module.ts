import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { PostService } from 'src/post/post.service';

@Module({
  providers: [UserResolver, UserService, PostService],
  exports: [UserService],
})
export class UserModule {}
