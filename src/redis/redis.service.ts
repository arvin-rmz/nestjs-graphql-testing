import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { REDIS_CLIENT, RedisClient } from './redis-client.type';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
  ) {}

  onModuleDestroy() {
    this.redis.quit();
  }

  ping() {
    return this.redis.ping();
  }

  async setItem(key: string, value: any): Promise<any> {
    if (!key) return;

    const stringifyValue = JSON.stringify(value);
    await this.redis.set(key, stringifyValue);

    return true;
  }

  async getItem(key: string): Promise<any> {
    if (!key) return false;

    const value = await this.redis.get(key);
    if (!value) return false;

    const parsedValue = JSON.parse(value);

    if (!parsedValue) return false;

    return parsedValue;
  }

  async clear(): Promise<boolean> {
    await this.redis.flushAll();

    return true;
  }
}
