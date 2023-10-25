import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest-graphql';
import { AppModule } from '../../../app.module';
import gql from 'graphql-tag';
import { RedisService } from 'src/redis/redis.service';
import { PrismaService } from 'src/prisma/prisma.service';

// const gql = '/graphql';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redisService: RedisService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    redisService = moduleRef.get(RedisService);

    await prisma.cleanDatabase();
  });

  afterAll(async () => {
    await redisService.onModuleDestroy();
  });

  // it('handles signup flow', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });

  describe('signup', () => {
    let signedupUser: any;

    it('should signup a user successfully', async () => {
      // return request(app.getHttpServer())
      //   .post(gql)
      //   .send({ mutation: '{signup {id name age breed }}' })
      //   .expect(200)
      //   .expect((res) => {
      //     expect(res.body.data.getCats).toEqual(cats);
      //   });
      const response = await request(app.getHttpServer())
        .mutate(gql`
          mutation Signup($signupInput: SignupInput) {
            signup(signupInput: $signupInput) {
              email
              firstName
              id
            }
          }
        `)
        .variables({
          signupInput: {
            email: 'supertest@test.com',
            password: 'password',
            firstName: 'Supertest',
          },
        });
      console.log(response, 'response');
      // .expectNoErrors();
      signedupUser = response.data;

      expect(signedupUser).toHaveProperty('accessToken');
    });
  });
});
