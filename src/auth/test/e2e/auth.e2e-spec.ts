import { AuthPayload, SignupInput, LoginInput } from '../../../graphql';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import request from 'supertest-graphql';
import gql from 'graphql-tag';
import { RedisService } from 'src/redis/redis.service';
import { setupApp } from 'src/setup-app';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorCode } from 'src/types/error.types';

describe('Auth e2e', () => {
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

    await app.init();
    await prisma.cleanDatabase();
  });

  afterEach(async () => {
    await redisService.onModuleDestroy();
  });

  describe('Authentication System', () => {
    const signupUser = async () => {
      const signupInput: SignupInput = {
        email: 'test@test.com',
        password: 'password',
        firstName: 'User',
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
            email: signupInput.email,
            password: signupInput.password,
            firstName: signupInput.firstName,
          },
        })
        .expectNoErrors();

      const existUser = response.data.signup.user;
      const accessToken = response.data.signup.accessToken;
      const refreshToken = response.data.signup.refreshToken;

      return { existUser, accessToken, refreshToken };
    };

    describe('Signup Flow', () => {
      it('should handle a signup mutation', async () => {
        let signupData: any;

        const signupInput: SignupInput = {
          email: 'test@test.com',
          password: 'password',
          firstName: 'User',
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
        expect(signupData.user).toHaveProperty(
          'firstName',
          signupInput.firstName,
        );
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

          await request<{ signup: AuthPayload }>(app.getHttpServer())
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

        it('should throw an custom Bad Request Error when password input value is less than 6 characters.', async () => {
          const invalidPasswordInput: SignupInput = {
            email: 'test@test.com',
            password: '12345',
            firstName: 'User',
          };

          const signupResponse = await request<{ signup: AuthPayload }>(
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
                email: invalidPasswordInput.email,
                password: invalidPasswordInput.password,
                firstName: invalidPasswordInput.firstName,
              },
            });

          const error = signupResponse.errors[0];

          const expectedError = {
            code: ErrorCode.BAD_REQUEST,
            field: 'password',
            messageRegex: new RegExp(
              'password must be longer than or equal to 6 characters',
              'i',
            ),
          };

          expect(error.message).toMatch(expectedError.messageRegex);
          expect(error).toHaveProperty('code', expectedError.code);
          expect(error).toHaveProperty('field', expectedError.field);
        });
      });
    });

    describe('Login Flow', () => {
      it('should handle a login mutation', async () => {
        const { existUser } = await signupUser();

        const loginResponse = await request<{ login: AuthPayload }>(
          app.getHttpServer(),
        )
          .mutate(gql`
            mutation Login($loginInput: LoginInput) {
              login(loginInput: $loginInput) {
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
            loginInput: {
              email: existUser.email,
              password: 'password',
            },
          })
          .expectNoErrors();

        const signinData = loginResponse.data.login;
        const signinUser = loginResponse.data.login.user;

        expect(signinUser).toHaveProperty('email', existUser.email);
        expect(signinUser).toHaveProperty('firstName', existUser.firstName);
        expect(signinUser).toHaveProperty('id');
        expect(signinData).toHaveProperty('accessToken');
        expect(signinData).toHaveProperty('refreshToken');
      });

      describe('should validate login input data', () => {
        it('should throw an Bad Request invalid email or password Error', async () => {
          const { existUser } = await signupUser();

          const invalidPasswordUser = {
            email: existUser.email,
            password: 'wrongPassword',
          };

          const loginResponse = await request<{ login: AuthPayload }>(
            app.getHttpServer(),
          )
            .mutate(gql`
              mutation Login($loginInput: LoginInput) {
                login(loginInput: $loginInput) {
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
              loginInput: {
                email: invalidPasswordUser.email,
                password: invalidPasswordUser.password,
              },
            });

          const responseError = loginResponse.errors[0];

          expect(responseError).toHaveProperty('code', ErrorCode.BAD_REQUEST);
          expect(responseError.message).toMatch(/invalid email or password/i);
        });

        it('should throw an Bad Request when invalid email is provided in login input.', async () => {
          await signupUser();

          const invalidEmailUser = {
            email: 'testtest.com',
            password: 'password',
          };

          const loginResponse = await request<{ login: AuthPayload }>(
            app.getHttpServer(),
          )
            .mutate(gql`
              mutation Login($loginInput: LoginInput) {
                login(loginInput: $loginInput) {
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
              loginInput: {
                email: invalidEmailUser.email,
                password: invalidEmailUser.password,
              },
            });

          const responseError = loginResponse.errors[0];

          expect(responseError).toHaveProperty('code', ErrorCode.BAD_REQUEST);
          expect(responseError).toHaveProperty('field', 'email');
          expect(responseError).toHaveProperty(
            'message',
            'email must be an email',
          );
        });

        it('should input value is less than 6 characters.', async () => {
          await signupUser();

          const invalidPasswordUser = {
            email: 'test@test.com',
            password: '12345',
          };
          const loginResponse = await request<{ login: AuthPayload }>(
            app.getHttpServer(),
          )
            .mutate(gql`
              mutation Login($loginInput: LoginInput) {
                login(loginInput: $loginInput) {
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
              loginInput: {
                email: invalidPasswordUser.email,
                password: invalidPasswordUser.password,
              },
            });
          const responseError = loginResponse.errors[0];
          expect(responseError).toHaveProperty('code', ErrorCode.BAD_REQUEST);
          expect(responseError).toHaveProperty('field', 'password');
          expect(responseError).toHaveProperty(
            'message',
            'password must be longer than or equal to 6 characters',
          );
        });
      });
    });

    describe('logout', () => {
      it('should log out user by removing the refresh token from Redis', async () => {
        const { existUser, accessToken } = await signupUser();

        const logoutResponse = await request<{ logout: string }>(
          app.getHttpServer(),
        )
          .mutate(gql`
            mutation Logout {
              logout
            }
          `)
          .set('Authorization', `Bearer ${accessToken}`)
          .expectNoErrors();

        const redisUserData = await redisService.getItem(
          existUser.id.toString(),
        );

        expect(logoutResponse.data.logout).toMatch(/Logged out successfully./i);
        expect(redisUserData).toBeFalsy();
      });
    });

    describe('refresh', () => {
      it('should return access token and refresh token when Authorization header set with valid refresh token', async () => {
        const { refreshToken } = await signupUser();

        const refreshResponse = await request<{
          refresh: { accessToken: string; refreshToken: string };
        }>(app.getHttpServer())
          .mutate(gql`
            mutation Refresh {
              refresh {
                accessToken
                refreshToken
              }
            }
          `)
          .set('Authorization', `Bearer ${refreshToken}`)
          .expectNoErrors();

        expect(refreshResponse.data.refresh).toHaveProperty('accessToken');
        expect(refreshResponse.data.refresh).toHaveProperty('refreshToken');
      });

      it('should update Redis server after refresh tokens with new refresh token', async () => {
        const { existUser, refreshToken, accessToken } = await signupUser();

        const refreshResponse = await request<{
          refresh: { accessToken: string; refreshToken: string };
        }>(app.getHttpServer())
          .mutate(gql`
            mutation Refresh {
              refresh {
                accessToken
                refreshToken
              }
            }
          `)
          .set('Authorization', `Bearer ${refreshToken}`)
          .expectNoErrors();

        const redisUserData = await redisService.getItem(
          existUser.id.toString(),
        );

        expect(redisUserData).toBe(refreshResponse.data.refresh.refreshToken);
      });

      it('should throw UNAUTHENTICATED error when invalid refresh token set in header', async () => {
        const { accessToken, refreshToken } = await signupUser();

        const refreshResponse = await request<{
          refresh: { accessToken: string; refreshToken: string };
        }>(app.getHttpServer())
          .mutate(gql`
            mutation Refresh {
              refresh {
                accessToken
                refreshToken
              }
            }
          `)
          .set('Authorization', `Bearer ${accessToken}`);

        const responseError = refreshResponse.errors[0];

        expect(responseError).toHaveProperty('code', ErrorCode.UNAUTHENTICATED);
        expect(responseError).toHaveProperty('message', 'Unauthorized');
      });
    });
  });
});
