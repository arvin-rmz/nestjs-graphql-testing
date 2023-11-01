import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { LiaraFileStorageService } from './liara-file-storage.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LiaraFileStorageService, ConfigService],
  exports: [LiaraFileStorageService],
})
export class LiaraFileStorageModule {}
