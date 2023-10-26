import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from '../../users.resolver';
import { UsersService } from '../../users.service';
import { PostsService } from 'src/posts/posts.service';
import { RedisService } from 'src/redis/redis.service';

describe('UserResolver', () => {
  let resolver: UsersResolver;
  const userService = {};
  const postsService = {};
  const redisService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: userService,
        },
        {
          provide: PostsService,
          useValue: postsService,
        },
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should have users Query', () => {
    expect(resolver).toBeDefined();
  });
});
