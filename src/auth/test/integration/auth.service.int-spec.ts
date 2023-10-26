import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { AuthService } from 'src/auth/auth.service';
import { SignupInputDTO } from 'src/auth/dto/signup.input.dto';
import { UsersService } from 'src/users/users.service';
import { AuthPayload } from 'src/graphql';
import { User } from 'prisma/prisma-client';
import { BadRequestError } from 'src/errors/bad-request.error';

describe('AuthService integration', () => {
  let prisma: PrismaService;
  let redisService: RedisService;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    redisService = moduleRef.get(RedisService);
    authService = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);

    await prisma.cleanDatabase();
  });

  afterEach(async () => {
    await redisService.onModuleDestroy();
  });

  describe('authService.signup() integration', () => {
    it('should signup a user correctly', async () => {
      const userToSignup = new SignupInputDTO();
      userToSignup.email = 'test@test.com';
      userToSignup.password = 'password';
      userToSignup.firstName = 'User';

      await authService.signup({ ...userToSignup });

      const user = await usersService.findByEmail(userToSignup.email);

      expect(user).toHaveProperty('email', userToSignup.email);
      expect(user).toHaveProperty('firstName', userToSignup.firstName);
    });

    it('should return user without password, access token and refresh token', async () => {
      const userToSignup = new SignupInputDTO();
      userToSignup.email = 'test@test.com';
      userToSignup.password = 'password';
      userToSignup.firstName = 'User';

      const authPayload: AuthPayload = await authService.signup({
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

      const { user, refreshToken }: AuthPayload = await authService.signup({
        ...userToSignup,
      });

      const redisData = await await redisService.getItem(user.id.toString());

      expect(redisData).toBe(refreshToken);
    });
  });

  describe('authService.login() integration', () => {
    interface IAuthPayload {
      user: User;
      accessToken: string;
      refreshToken: string;
    }

    const signupUser = async (): Promise<IAuthPayload> => {
      const userToSignup = new SignupInputDTO();
      userToSignup.email = 'test@test.com';
      userToSignup.password = 'password';
      userToSignup.firstName = 'User';

      return authService.signup({ ...userToSignup });
    };

    it('should return user without password, access token and refresh token.', async () => {
      const {
        user: { id, email, firstName },
      } = await signupUser();

      const userToLogin: Omit<User, 'password'> = {
        email,
        id,
        firstName,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastName: null,
      };

      const loginPayload = await authService.login({ ...userToLogin });

      expect(loginPayload).toHaveProperty('user');
      expect(loginPayload.user).toHaveProperty('email', email);
      expect(loginPayload.user).toHaveProperty('firstName', firstName);
      expect(loginPayload.user).toHaveProperty('id', id);
      expect(loginPayload.user).toHaveProperty('createdAt');
      expect(loginPayload.user).toHaveProperty('updatedAt');
      expect(loginPayload).toHaveProperty('accessToken');
      expect(loginPayload).toHaveProperty('refreshToken');
    });

    it('should save user.id and refresh token in Redis', async () => {
      const {
        user: { id, email, firstName },
      } = await signupUser();

      await redisService.removeItem(id.toString());

      const userToLogin: Omit<User, 'password'> = {
        email,
        id: +id,
        firstName,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastName: null,
      };

      const loginPayload = await authService.login({ ...userToLogin });

      const loginRedisData = await redisService.getItem(id.toString());

      expect(loginRedisData).toBe(loginPayload.refreshToken);
    });
  });

  describe('authService.logout() integration', () => {
    it('should remove user.id and refresh token from Redis', async () => {
      const userToSignup = new SignupInputDTO();
      userToSignup.email = 'test@test.com';
      userToSignup.password = 'password';
      userToSignup.firstName = 'User';

      const { user } = await authService.signup({ ...userToSignup });

      const logoutPayload = await authService.logout({
        email: user.email,
        sub: user.id,
        exp: 123456,
        iat: 123456,
      });

      const redisUserData = await redisService.getItem(user.id.toString());

      expect(redisUserData).not.toBeTruthy();
      expect(logoutPayload).toMatch(/logged out successfully/i);
    });
  });

  describe('authService.validateUser() integration', () => {
    interface IAuthPayload {
      user: User;
      accessToken: string;
      refreshToken: string;
    }

    const signupUser = async (): Promise<IAuthPayload> => {
      const userToSignup = new SignupInputDTO();
      userToSignup.email = 'test@test.com';
      userToSignup.password = 'password';
      userToSignup.firstName = 'User';

      return authService.signup({ ...userToSignup });
    };

    it('should return user without password when email and password are correct', async () => {
      const { user } = await signupUser();
      const userPassword = 'password';

      const validatedUser = await authService.validateUser(
        user.email,
        userPassword,
      );

      expect(validatedUser).not.toHaveProperty('password');
      expect(validatedUser).toHaveProperty('email', user.email);
    });

    it('should throw custom Bad Request Error when user does not exist with provided email', async () => {
      await signupUser();

      const notExistUser = {
        email: 'not-exist-user@test.com',
        password: 'password',
      };

      await expect(
        authService.validateUser(notExistUser.email, notExistUser.password),
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw custom Bad Request Error when invalid password provided', async () => {
      const { user } = await signupUser();
      const invalidUserPassword = 'invalidPassword';

      await expect(
        authService.validateUser(user.email, invalidUserPassword),
      ).rejects.toThrow(BadRequestError);
    });
  });
});
