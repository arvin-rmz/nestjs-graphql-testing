import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from 'prisma/prisma-client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private prisma: PrismaClient;

  constructor(private config: ConfigService) {
    super();

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  // async onModuleInit() {
  //   await this.$connect();
  // }

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      await this.prisma.$connect();
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    const modelNames = {
      user: 'user',
    };

    const models = Reflect.ownKeys(this).filter(
      (key) => key === modelNames.user,
    );

    return Promise.all(
      models.map((modelKey) => this.prisma[modelKey].deleteMany()),
    );
  }

  getClientInstance() {
    return this.prisma;
  }
}
