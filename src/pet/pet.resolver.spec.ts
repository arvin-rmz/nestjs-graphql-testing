import { Test, TestingModule } from '@nestjs/testing';
import { PetResolver } from './pet.resolver';
import { PetService } from './pet.service';

describe('PetResolver', () => {
  let resolver: PetResolver;
  const petService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetResolver,
        {
          provide: PetService,
          useValue: petService,
        },
      ],
    }).compile();

    resolver = module.get<PetResolver>(PetResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
