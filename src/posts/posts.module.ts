import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersService } from 'src/users/users.service';
import { DataLoaderService } from 'src/dataloader/dataloader.service';
import { LiaraFileStorageService } from 'src/liara-file-storage/liara-file-storage.service';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';

@Module({
  providers: [
    PostsService,
    PostsResolver,
    UsersService,
    DataLoaderService,
    LiaraFileStorageService,
    ConfigService,
  ],
})
export class PostsModule {}
