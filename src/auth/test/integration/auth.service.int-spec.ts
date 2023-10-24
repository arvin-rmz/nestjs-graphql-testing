import { REDIS_CLIENT, RedisClient } from 'src/redis//redis-client.type';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

describe('signin() integration', () => {
  let prisma: PrismaService;
  let redisService: RedisService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    redisService = moduleRef.get(RedisService);
    // todoService = moduleRef.get(TodoService);
    await prisma.cleanDatabase();
  });

  afterAll(async () => {
    await redisService.onModuleDestroy();
  });

  it('should sign in a user correctly', async () => {
    console.log(process.env.DATABASE_URL, 'ENV');
  });
});
