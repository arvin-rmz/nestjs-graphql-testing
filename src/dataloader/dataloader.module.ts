import { Module } from '@nestjs/common';
import { DataLoaderService } from './dataloader.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [DataLoaderService, UserService],
  exports: [DataLoaderService],
})
export class DataloaderModule {}
