import { Module } from '@nestjs/common';

import { DataLoaderService } from './dataloader.service';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [DataLoaderService, UsersService],
  exports: [DataLoaderService],
})
export class DataloaderModule {}
