import { Module } from '@nestjs/common';

import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { UsersService } from 'src/users/users.service';
import { DataLoaderService } from 'src/dataloader/dataloader.service';
import { LiaraFileStorageService } from 'src/liara-file-storage/liara-file-storage.service';
import { ConfigService } from '@nestjs/config';

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
