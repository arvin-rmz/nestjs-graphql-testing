import { AuthPayload, SignupInput } from './../../src/graphql';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import request from 'supertest-graphql';
import gql from 'graphql-tag';
import { RedisService } from 'src/redis/redis.service';
import { setupApp } from 'src/setup-app';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorCode } from 'src/types/error.types';

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

  afterEach(async () => {
    await redisService.onModuleDestroy();
  });

  it('should handle a signup request', async () => {
    let signupData: any;

    const signupInput: SignupInput = {
      email: 'test@test.com',
      password: 'password',
      firstName: 'User',
    };

    const response = await request<{ signup: AuthPayload }>(app.getHttpServer())
      .mutate(gql`
        mutation Signup($signupInput: SignupInput) {
          signup(signupInput: $signupInput) {
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
      .variables({
        signupInput: {
          email: signupInput.email,
          password: signupInput.password,
          firstName: signupInput.firstName,
        },
      })
      .expectNoErrors();

    signupData = response.data.signup;

    expect(signupData).toHaveProperty('accessToken');
    expect(signupData).toHaveProperty('refreshToken');
    expect(signupData).toHaveProperty('user');
    expect(signupData.user).toHaveProperty('email', signupInput.email);
    expect(signupData.user).toHaveProperty('id');
    expect(signupData.user).toHaveProperty('firstName', signupInput.firstName);
  });

  describe('Validate signup input data', () => {
    it('should throw a custom Bad Request error when input email is not valid', async () => {
      const invalidSignupInput: SignupInput = {
        email: 'testtest.com',
        password: 'password',
        firstName: 'user',
      };

      const response = await request<{ signup: AuthPayload }>(
        app.getHttpServer(),
      )
        .mutate(gql`
          mutation Signup($signupInput: SignupInput) {
            signup(signupInput: $signupInput) {
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
        .variables({
          signupInput: {
            ...invalidSignupInput,
          },
        });

      const error = response.errors[0];

      const expectedError = {
        code: ErrorCode.BAD_REQUEST,
        field: 'email',
      };

      expect(error).toHaveProperty('message');

      expect(error).toHaveProperty('field', expectedError.field);
      expect(error).toHaveProperty('code', expectedError.code);
    });

    it('should throw an USER_ALREADY_EXIST error and provide email input in error.message', async () => {
      const signupInput: SignupInput = {
        email: 'test@test.com',
        password: 'password',
        firstName: 'User',
      };

      const initialSignupResponse = await request<{ signup: AuthPayload }>(
        app.getHttpServer(),
      )
        .mutate(gql`
          mutation Signup($signupInput: SignupInput) {
            signup(signupInput: $signupInput) {
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
        .variables({
          signupInput: {
            email: signupInput.email,
            password: signupInput.password,
            firstName: signupInput.firstName,
          },
        })
        .expectNoErrors();

      const errorResponse = await request<{ signup: AuthPayload }>(
        app.getHttpServer(),
      )
        .mutate(gql`
          mutation Signup($signupInput: SignupInput) {
            signup(signupInput: $signupInput) {
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
        .variables({
          signupInput: {
            ...signupInput,
          },
        });

      const error = errorResponse.errors[0];

      const expectedError = {
        code: ErrorCode.USER_ALREADY_EXIST,
        messageRegex: new RegExp(signupInput.email),
      };

      expect(error.message).toMatch(expectedError.messageRegex);
      expect(error).toHaveProperty('code', expectedError.code);
    });
  });
});
