import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { User } from 'prisma/prisma-client';

import { UserService } from 'src/user/user.service';
import { IDataloaders } from './dataloader.interface';

// REFERENCE ==> https://blog.logrocket.com/use-dataloader-nestjs/

type BatchUsers = (ids: number[]) => Promise<User[]>;

@Injectable()
export class DataLoaderService {
  constructor(private readonly userService: UserService) {}

  getLoaders(): IDataloaders {
    const userLoader = this._createUserLoader();
    return {
      userLoader,
    };
  }

  private _createUserLoader() {
    const userLoader = new DataLoader<number, User>(this._batchUsers);

    return userLoader;
  }

  private _batchUsers: BatchUsers = async (ids: number[]) => {
    return this.userService.getAllByBatch(ids as number[]);
  };
}
