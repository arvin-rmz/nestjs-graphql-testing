import { Test, TestingModule } from '@nestjs/testing';
import { PetsResolver } from './pets.resolver';
import { PetsService } from './pets.service';

describe('PetResolver', () => {
  let resolver: PetsResolver;
  const petService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsResolver,
        {
          provide: PetsService,
          useValue: petService,
        },
      ],
    }).compile();

    resolver = module.get<PetsResolver>(PetsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
