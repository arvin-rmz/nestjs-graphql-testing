import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisClient, REDIS_CLIENT } from './redis-client.type';

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    const url = validateAndCreateRedisUrl();

    const client = createClient({
      url,
    });

    try {
      await client.connect();
      return client;
    } catch (error) {
      throw new Error('Fail to connect to Redis Server');
    }
  },
};

const validateAndCreateRedisUrl = () => {
  // Redis Database number will change based on test,
  // development and production environments
  const redisDatabaseNumber = {
    test: 0,
    development: 1,
    production: 2,
  };

  if (!process.env?.REDIS_HOST || !process.env?.REDIS_PORT) {
    throw new Error(
      'Please provide valid REDIS_HOST and REDIS_PORT environment variables',
    );
  }

  const redisUrl = `redis://${process.env?.REDIS_HOST}:${process.env
    ?.REDIS_PORT}/${redisDatabaseNumber[process.env?.NODE_ENV]}`;

  return redisUrl;
};
