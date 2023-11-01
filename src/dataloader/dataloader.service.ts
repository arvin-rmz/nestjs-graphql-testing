import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { User } from 'prisma/prisma-client';

import { File as GraphqlFileType } from 'src/graphql';
import { UsersService } from 'src/users/users.service';
import { IDataloaders } from './dataloader.interface';
import { PostsService } from 'src/posts/posts.service';

// REFERENCE ==> https://blog.logrocket.com/use-dataloader-nestjs/

type BatchUsers = (ids: number[]) => Promise<User[]>;

type BatchPostFiles = (ids: number[]) => Promise<GraphqlFileType[][]>;

@Injectable()
export class DataLoaderService {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  getLoaders(): IDataloaders {
    const userLoader = this._createUserLoader();
    const postFilesLoader = this._createPostFilesLoader();

    return {
      userLoader,
      postFilesLoader,
    };
  }

  private _createPostFilesLoader(): DataLoader<number, GraphqlFileType[]> {
    const postFilesLoader = new DataLoader<number, GraphqlFileType[]>(
      this._batchPostFiles,
    );

    return postFilesLoader;
  }

  private _batchPostFiles: BatchPostFiles = async (ids: number[]) => {
    return this.postsService.getAllByBatch(ids as number[]);
  };

  private _createUserLoader(): DataLoader<number, User> {
    const userLoader = new DataLoader<number, User>(this._batchUsers);

    return userLoader;
  }

  private _batchUsers: BatchUsers = async (ids: number[]) => {
    return this.usersService.getAllByBatch(ids as number[]);
  };
}
