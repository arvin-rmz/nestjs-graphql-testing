import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LoginInputDTO } from './dto/login.input.dto';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authMockService: AuthService;

  let loginInputDTO = new LoginInputDTO();
  loginInputDTO.email = 'test@example.com';
  loginInputDTO.password = '123456';

  const authService = {
    login: jest.fn((loginInput) => ({
      id: 'fake-id',
      ...loginInputDTO,
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
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authMockService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('login successfully and return accessToken', () => {
    expect(resolver).toBeDefined();

    expect(resolver.login(loginInputDTO, {})).toEqual({
      id: 'fake-id',
      ...loginInputDTO,
    });

    expect(authMockService.login).toBeCalledWith(loginInputDTO);
  });
});
