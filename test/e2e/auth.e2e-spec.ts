import { SignupInput } from './../../src/graphql';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import request from 'supertest-graphql';
import gql from 'graphql-tag';
import { RedisService } from 'src/redis/redis.service';
import { setupApp } from 'src/setup-app';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Authentication System', () => {
  let app: INestApplication;
  let redisService: RedisService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);

    redisService = moduleFixture.get(RedisService);
    prisma = moduleFixture.get(PrismaService);

    await prisma.cleanDatabase();

    await app.init();
  });

  afterAll(async () => {
    await redisService.onModuleDestroy();
  });

  it('should handle a signup request', async () => {
    let signupData: any;

    const response = await request(app.getHttpServer())
      .mutate(gql`
        mutation {
          signup(
            signupInput: {
              email: "supertest@test.com"
              password: "password"
              firstName: "Supertest"
            }
          ) {
            accessToken
            refreshToken
            user {
              email
              id
              firstName
            }
          }
        }
      `)
      // .mutate(gql`
      //   mutation Signup($signupInput: SignupInput) {
      //     signup(signupInput: $signupInput) {
      //       email
      //       firstName
      //       id
      //     }
      //   }
      // `)
      .variables({
        signupInput: {
          email: 'supertest@test.com',
          password: 'password',
          firstName: 'Supertest',
        },
      });
    console.log(response.data, 'response');
    // .expectNoErrors();

    // @ts-ignore
    signupData = response.data.signup;

    expect(signupData).toHaveProperty('accessToken');
    expect(signupData).toHaveProperty('refreshToken');
    expect(signupData).toHaveProperty('user');
    expect(signupData.user).toHaveProperty('email', 'supertest@test.com');
    expect(signupData.user).toHaveProperty('id');
    expect(signupData.user).toHaveProperty('firstName', 'Supertest');
  });
});
