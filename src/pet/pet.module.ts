import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetResolver } from './pet.resolver';

@Module({
  providers: [PetResolver, PetService],
})
export class PetModule {}
