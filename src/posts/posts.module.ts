import { Module } from '@nestjs/common';

import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { UsersService } from 'src/users/users.service';
import { DataLoaderService } from 'src/dataloader/dataloader.service';

@Module({
  providers: [PostsService, PostsResolver, UsersService, DataLoaderService],
})
export class PostsModule {}
