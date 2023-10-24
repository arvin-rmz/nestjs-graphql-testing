import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from 'prisma/prisma-client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;
    const models = Reflect.ownKeys(this).filter(
      (key) =>
        key[0] !== '_' &&
        key[0] !== '$' &&
        typeof key !== 'symbol' &&
        key !== 'config',
    );

    // console.log(models.map((model) => model));
    // console.log(models.map((modelKey) => this[modelKey].delete()));
    return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
  }
}
