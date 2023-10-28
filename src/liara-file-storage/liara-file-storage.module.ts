import { Global, Module } from '@nestjs/common';
import { LiaraFileStorageService } from './liara-file-storage.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LiaraFileStorageService, ConfigService],
  exports: [LiaraFileStorageService],
})
export class LiaraFileStorageModule {}
