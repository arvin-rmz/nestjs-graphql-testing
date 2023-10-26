import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { AuthService } from 'src/auth/auth.service';
import { SignupInputDTO } from 'src/auth/dto/signup.input.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'prisma/prisma-client';
import { AuthResolver } from 'src/auth/auth.resolver';
import { LoginInputDTO } from 'src/auth/dto/login.input.dto';
import { IGraphQLContext } from 'src/types/gql-context.types';
import { ForbiddenError } from 'src/errors/forbidden.error';

interface IAuthResolverResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

describe('AuthResolver integration', () => {
  let prisma: PrismaService;
  let redisService: RedisService;
  let authService: AuthService;
  let usersService: UsersService;
  let authResolver: AuthResolver;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    redisService = moduleRef.get(RedisService);
    authService = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);
    authResolver = moduleRef.get(AuthResolver);

    await prisma.cleanDatabase();
  });

  afterEach(async () => {
    await redisService.onModuleDestroy();
  });

  describe('signup() mutation integration', () => {
    it('should signup a user correctly and save the user to database', async () => {
      const userToSignup = new SignupInputDTO();
      userToSignup.email = 'test@test.com';
      userToSignup.password = 'password';
      userToSignup.firstName = 'User';

      await authResolver.signup({ ...userToSignup });

      const user = await usersService.findByEmail(userToSignup.email);

      expect(user).toHaveProperty('email', userToSignup.email);
      expect(user).toHaveProperty('firstName', userToSignup.firstName);
    });

    it('should return user without password, access token and refresh token', async () => {
      const userToSignup = new SignupInputDTO();
      userToSignup.email = 'test@test.com';
      userToSignup.password = 'password';
      userToSignup.firstName = 'User';

      const authPayload: IAuthResolverResponse = await authResolver.signup({
        ...userToSignup,
      });

      expect(authPayload.user).not.toHaveProperty('password');
      expect(authPayload.user).toHaveProperty('email', userToSignup.email);
      expect(authPayload.user).toHaveProperty(
        'firstName',
        userToSignup.firstName,
      );
      expect(authPayload.user).toHaveProperty('id');
      expect(authPayload.user).toHaveProperty('createdAt');
      expect(authPayload.user).toHaveProperty('updatedAt');
      expect(authPayload).toHaveProperty('accessToken');
      expect(authPayload).toHaveProperty('refreshToken');
    });

    it('should save user.id and refresh token in Redis', async () => {
      const userToSignup = new SignupInputDTO();
      userToSignup.email = 'test@test.com';
      userToSignup.password = 'password';
      userToSignup.firstName = 'User';

      const { user, refreshToken }: IAuthResolverResponse =
        await authResolver.signup({
          ...userToSignup,
        });

      const redisUserData = await redisService.getItem(user.id.toString());

      expect(redisUserData).toBe(refreshToken);
    });
  });

  describe('login() mutation integration', () => {
    const signupUser = async (): Promise<IAuthResolverResponse> => {
      const userToSignup = new SignupInputDTO();
      userToSignup.email = 'test@test.com';
      userToSignup.password = 'password';
      userToSignup.firstName = 'User';

      return authResolver.signup({ ...userToSignup });
    };

    it('should login a user and return user data without password, access token and refresh token', async () => {
      const signupResponse = await signupUser();

      const userToLogin = new LoginInputDTO();
      userToLogin.email = signupResponse.user.email;
      userToLogin.password = 'password';

      const loginResponse: IAuthResolverResponse = await authResolver.login(
        {
          ...userToLogin,
        },
        { user: signupResponse.user } as unknown as IGraphQLContext,
      );

      expect(loginResponse).toHaveProperty('user');
      expect(loginResponse).toHaveProperty('user.email', userToLogin.email);
      expect(loginResponse).toHaveProperty('user.id', signupResponse.user.id);

      expect(loginResponse).not.toHaveProperty('user.password');

      expect(loginResponse).toHaveProperty('accessToken');
      expect(loginResponse).toHaveProperty('refreshToken');
    });

    it('should save user.id and refresh token in Redis', async () => {
      const signupResponse = await signupUser();

      const userToLogin = new LoginInputDTO();
      userToLogin.email = signupResponse.user.email;
      userToLogin.password = 'password';

      const removedRedisSignupData = await redisService.removeItem(
        signupResponse.user.id.toString(),
      );

      const loginResponse: IAuthResolverResponse = await authResolver.login(
        {
          ...userToLogin,
        },
        { user: signupResponse.user } as unknown as IGraphQLContext,
      );

      const redisLoginData = await redisService.getItem(
        loginResponse.user.id.toString(),
      );

      expect(removedRedisSignupData).toBeTruthy();

      expect(redisLoginData).toBe(loginResponse.refreshToken);
    });
  });

  describe('logout() mutation integration', () => {
    const signupUser = async (): Promise<IAuthResolverResponse> => {
      const userToSignup = new SignupInputDTO();
      userToSignup.email = 'test@test.com';
      userToSignup.password = 'password';
      userToSignup.firstName = 'User';

      return authResolver.signup({ ...userToSignup });
    };

    it('should logout user and remove user.id and refresh token from Redis', async () => {
      const signupResponse = await signupUser();
      const mockGraphqlContext = {
        req: {
          user: {
            email: signupResponse.user.email,
            sub: signupResponse.user.id,
          },
        },
      } as unknown as IGraphQLContext;

      const redisSignupRefreshToken = await redisService.getItem(
        mockGraphqlContext.req.user.sub.toString(),
      );

      const logoutResponse = await authResolver.logout(mockGraphqlContext);

      expect(logoutResponse).toMatch(/logged out successfully/i);
      expect(redisSignupRefreshToken).toBe(signupResponse.refreshToken);
      expect(
        await redisService.getItem(mockGraphqlContext.req.user.sub.toString()),
      ).toBeFalsy();
    });
  });

  describe('refresh() mutation integration', () => {
    const signupUser = async (): Promise<IAuthResolverResponse> => {
      const userToSignup = new SignupInputDTO();
      userToSignup.email = 'test@test.com';
      userToSignup.password = 'password';
      userToSignup.firstName = 'User';

      return authResolver.signup({ ...userToSignup });
    };

    it('should return access token and refresh token', async () => {
      const signupResponse = await signupUser();

      const mockGraphqlContext = {
        req: {
          user: {
            email: signupResponse.user.email,
            sub: signupResponse.user.id,
          },
        },
      } as unknown as IGraphQLContext;

      const refreshResponse = await authResolver.refresh(mockGraphqlContext);

      expect(refreshResponse.accessToken).toBeTruthy();
      expect(refreshResponse.refreshToken).toBeTruthy();
    });

    it('should throw a custom ForbiddenError when refresh token is not exist Redis with provided user.id', async () => {
      const signupResponse = await signupUser();

      const mockGraphqlContext = {
        req: {
          user: {
            email: signupResponse.user.email,
            sub: signupResponse.user.id,
          },
        },
      } as unknown as IGraphQLContext;

      const removedRedisSignupData = await redisService.removeItem(
        mockGraphqlContext.req.user.sub.toString(),
      );

      expect(removedRedisSignupData).toBeTruthy();

      await expect(authResolver.refresh(mockGraphqlContext)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });
});
