import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginPayload, UserPayload } from 'src/graphql';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => {
  return {
    compare: (pass: string) => true,
    hash: jest.fn((pass: string, salt: number) => 'hashedPassword'),
  };
});

const mockUser: {
  firstName: string;
  lastName?: string;
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

const mockCreateUser: () => UserPayload = () => {
  const { password, ...user } = mockUser;

  return {
    userErrors: [],
    user,
  };
};

const getMockLoginInput = () => ({
  email: 'john@example.com',
  password: 'password',
});

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let userService: UserService;
  let jwtService: JwtService;

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
          provide: UserService,
          useValue: {
            create: jest.fn().mockReturnValue(mockCreateUser()),
          },
        },

        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('validJwtToken'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login()', () => {
    const mockUserToLogin = getMockLoginInput();

    it('should return login payload when login input is valid', async () => {
      const response = await service.login({ ...mockUserToLogin });

      expect(response).toHaveProperty('userErrors');
      expect(response).toHaveProperty('user');
      expect(response).toHaveProperty('tokens');
      expect(response.tokens.accessToken).toBeDefined();
      expect(response.user.email).toBeDefined();
      expect(response.user.firstName).toBeDefined();
      expect(response.user.lastName).toBeDefined();
    });

    it('should not provide password field in login payload', async () => {
      const response = await service.login(mockUserToLogin);
      expect(response.user).not.toHaveProperty('password');
    });

    it('should throw unauthorized error when login input in not valid', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      await expect(
        service.login({
          email: mockUserToLogin.email,
          password: 'invalidPassword',
        }),
      ).rejects.toThrowError(UnauthorizedException);
    });
  });

  describe('signup()', () => {
    const getUserToSignup = () => ({
      email: mockUser.email,
      firstName: mockUser.firstName,
      password: 'password',
    });

    it('should hash the password, create user and create jwt token', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(jest.fn(() => 'hashedPassword'));

      await service.signup(getUserToSignup());

      expect(bcrypt.hash).toBeCalledWith(getUserToSignup().password, 12);

      expect(userService.create).toBeCalledWith({
        ...getUserToSignup(),
        password: 'hashedPassword',
      });

      expect(jwtService.sign).toBeCalledWith({
        email: getUserToSignup().email,
      });
    });

    it('should return correct signup payload when valid signup input provided, user info (without password) and access token.', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(jest.fn(() => 'hashedPassword'));

      const response = await service.signup(getUserToSignup());

      expect(response).toHaveProperty('userErrors');
      expect(response).toHaveProperty('user');
      expect(response).toHaveProperty('tokens');
      expect(response.tokens.accessToken).toBeDefined();
      expect(response.user.email).toBeDefined();
      expect(response.user.firstName).toBeDefined();
      expect(response.user.lastName).toBeDefined();
    });

    it('should not include password in response when valid signup input provided', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(jest.fn(() => 'hashedPassword'));

      const response = await service.signup(getUserToSignup());

      expect(response.user).not.toHaveProperty('password');
    });
  });

  describe('validateUser()', () => {
    const mockUserToValidate = getMockLoginInput();

    it('should return null when user is not exists', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockImplementation(() => null);

      expect(
        await service.validateUser(
          mockUserToValidate.email,
          mockUserToValidate.password,
        ),
      ).toBe(null);
    });

    it('should return null when provided password did not match.', async () => {
      const mockPrismaFindUniqueUser = jest.fn().mockReturnValue(mockUser);

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockImplementation(mockPrismaFindUniqueUser);

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      expect(
        await service.validateUser(
          mockUserToValidate.email,
          mockUserToValidate.password,
        ),
      ).toBe(null);
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
