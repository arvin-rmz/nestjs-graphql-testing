import { Module } from '@nestjs/common';

import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { PostsService } from 'src/posts/posts.service';

@Module({
  providers: [UsersResolver, UsersService, PostsService],
  exports: [UsersService],
})
export class UsersModule {}
