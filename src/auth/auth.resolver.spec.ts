import { Test, TestingModule } from '@nestjs/testing';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LoginInputDTO } from './dto/login.input.dto';
import { IGraphQLContext } from 'src/types/gql-context.types';
import { RedisService } from 'src/redis/redis.service';

const mockUser: {
  firstName: string;
  lastName: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
} = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const getMockGqlContext: () => Partial<IGraphQLContext> = () => ({
  user: {
    ...mockUser,
    id: 1,
  },
});

const getAuthPayload = () => ({
  user: getMockGqlContext().user,
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
});

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authMockService: AuthService;

  let loginInputDTO = new LoginInputDTO();
  loginInputDTO.email = 'test@example.com';
  loginInputDTO.password = '123456';

  const authService = {
    login: jest.fn((userContext) => ({
      ...getAuthPayload(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: RedisService,
          useValue: {
            setItem: jest.fn().mockReturnValue(true),
            getItem: jest.fn().mockReturnValue('userRefreshToken'),
          },
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authMockService = module.get<AuthService>(AuthService);
  });

  it('should call authService.login with user context', async () => {
    const mockLogin = jest.fn().mockReturnValue(getAuthPayload());
    jest.spyOn(authService, 'login').mockImplementation(mockLogin);

    await resolver.login(loginInputDTO, getMockGqlContext() as IGraphQLContext);

    expect(authService.login).toBeCalledWith(getMockGqlContext().user);
  });

  it('login successfully and return user, access token and refresh token', async () => {
    const response = await resolver.login(
      loginInputDTO,
      getMockGqlContext() as IGraphQLContext,
    );

    expect(response).toHaveProperty('accessToken');
    expect(response).toHaveProperty('refreshToken');
    expect(response).toHaveProperty('user');
  });
});
