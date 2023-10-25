import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisClient, REDIS_CLIENT } from './redis-client.type';

// console.log(`redis://${process.env?.REDIS_HOST}:${process.env?.REDIS_PORT}/0`);

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    const client = createClient({
      url: `redis://${process.env?.REDIS_HOST}:${process.env?.REDIS_PORT}/0`,
    });
    await client.connect();
    return client;
  },
};
