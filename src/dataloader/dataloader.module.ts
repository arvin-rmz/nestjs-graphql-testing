import { Module } from '@nestjs/common';

import { DataLoaderService } from './dataloader.service';
import { UsersService } from 'src/users/users.service';
import { PostsService } from 'src/posts/posts.service';

@Module({
  providers: [DataLoaderService, UsersService, PostsService],
  exports: [DataLoaderService],
})
export class DataloaderModule {}
