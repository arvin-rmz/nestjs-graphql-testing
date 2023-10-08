import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { UserService } from 'src/user/user.service';
import { DataLoaderService } from 'src/dataloader/dataloader.service';

@Module({
  providers: [PostService, PostResolver, UserService, DataLoaderService],
})
export class PostModule {}
