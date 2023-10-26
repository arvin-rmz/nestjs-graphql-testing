import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../../auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { RedisService } from 'src/redis/redis.service';
import { BadRequestError } from 'src/errors/bad-request.error';

jest.mock('bcrypt', () => {
  return {
    compare: jest.fn().mockImplementation((password: string) => true),
    hash: jest.fn((pass: string, salt: number) => 'hashedPassword'),
  };
});

const mockUser: {
  firstName: string;
  lastName: string | null;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
} = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@example.com',
  password: 'hashedPassword',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCreateUser = () => {
  return { ...mockUser, id: 1 };
};

const getMockLoginInput = () => {
  const { password, ...user } = { ...mockUser };

  return { ...user, id: 1 };
};

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let redisService: RedisService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockReturnValue(mockUser),
              create: jest.fn().mockReturnValue(mockUser),
            },
          },
        },

        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockReturnValue(mockCreateUser()),
            findByEmail: jest.fn().mockReturnValue(mockCreateUser()),
          },
        },

        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('validJwtToken'),
          },
        },

        {
          provide: RedisService,
          useValue: {
            setItem: jest.fn().mockReturnValue(true),
            getItem: jest.fn().mockReturnValue('userRefreshToken'),
          },
        },

        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('Some environment variables'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('login()', () => {
    const mockUserToLogin = getMockLoginInput();

    it('should return login payload when login input is valid', async () => {
      const response = await service.login({ ...mockUserToLogin });

      expect(response).toHaveProperty('userErrors');
      expect(response).toHaveProperty('user');
      expect(response.accessToken).toBeDefined();
      expect(response.refreshToken).toBeDefined();
      expect(response.user.email).toBeDefined();
      expect(response.user.firstName).toBeDefined();
      expect(response.user.lastName).toBeDefined();
    });

    it('should not provide password field in login payload', async () => {
      const response = await service.login(mockUserToLogin);
      expect(response.user).not.toHaveProperty('password');
    });
  });

  describe('signup()', () => {
    const getUserToSignup = () => ({
      email: mockUser.email,
      firstName: mockUser.firstName,
      password: 'password',
    });

    it('should hash the password, create user and create jwt token', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwtToken');
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(jest.fn(() => 'hashedPassword'));

      await service.signup(getUserToSignup());

      expect(bcrypt.hash).toBeCalledWith(getUserToSignup().password, 12);

      expect(usersService.create).toBeCalledWith({
        ...getUserToSignup(),
        password: 'hashedPassword',
      });

      expect(jwtService.signAsync).toBeCalledWith(
        expect.objectContaining({
          email: getUserToSignup().email,
          sub: mockCreateUser().id,
        }),
        expect.any(Object),
      );
    });

    it('should return correct signup payload when valid signup input provided, user info (without password) and access and refresh tokens.', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwtToken');
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(jest.fn(() => 'hashedPassword'));

      const response = await service.signup(getUserToSignup());

      expect(response).toHaveProperty('userErrors');
      expect(response).toHaveProperty('user');
      expect(response.accessToken).toBeDefined();
      expect(response.refreshToken).toBeDefined();
      expect(response.user.email).toBeDefined();
      expect(response.user.firstName).toBeDefined();
      expect(response.user.lastName).toBeDefined();
    });

    it('should not include password in response when valid signup input provided', async () => {
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwtToken');
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(jest.fn(() => 'hashedPassword'));

      const response = await service.signup(getUserToSignup());

      expect(response.user).not.toHaveProperty('password');
    });
  });

  describe('validateUser()', () => {
    const mockUserToValidate = {
      email: 'test@test.com',
      password: 'password',
    };

    it('should throw a bad request error when user is not exists with the provided email.', async () => {
      jest.spyOn(usersService, 'findByEmail').mockImplementation(() => null);

      await expect(
        service.validateUser(
          mockUserToValidate.email,
          mockUserToValidate.password,
        ),
      ).rejects.toThrowError(BadRequestError);
    });

    it('should throw a bad request error when provided password did not match.', async () => {
      const mockUserFindByEmail = jest.fn().mockReturnValue(mockCreateUser());
      jest
        .spyOn(usersService, 'findByEmail')
        .mockImplementation(mockUserFindByEmail);

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      await expect(
        service.validateUser(
          mockUserToValidate.email,
          mockUserToValidate.password,
        ),
      ).rejects.toThrowError(BadRequestError);
    });

    it('should not provide password in response when user is valid', async () => {
      const mockPrismaFindUniqueUser = jest.fn().mockReturnValue(mockUser);

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockImplementation(mockPrismaFindUniqueUser);

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      const response = await service.validateUser(
        mockUserToValidate.email,
        mockUserToValidate.password,
      );

      expect(response).not.toHaveProperty('password');
    });
  });
});
