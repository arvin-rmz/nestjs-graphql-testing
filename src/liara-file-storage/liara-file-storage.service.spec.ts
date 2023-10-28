import { Test, TestingModule } from '@nestjs/testing';
import { LiaraFileStorageService } from './liara-file-storage.service';

describe('LiaraFileStorageService', () => {
  let service: LiaraFileStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiaraFileStorageService],
    }).compile();

    service = module.get<LiaraFileStorageService>(LiaraFileStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
