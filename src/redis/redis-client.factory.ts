import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisClient, REDIS_CLIENT } from './redis-client.type';

// Redis Database number will change based on test, development and production environments
const redisDatabaseNumber = {
  test: 0,
  development: 1,
  production: 2,
};

const REDIS_URL = `redis://${process.env?.REDIS_HOST}:${process.env
  ?.REDIS_PORT}/${redisDatabaseNumber[process.env?.NODE_ENV]}`;

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    const client = createClient({
      url: REDIS_URL,
    });
    await client.connect();
    return client;
  },
};
