import { CreatePetInputDTO } from './create-pet.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdatePetInput extends PartialType(CreatePetInputDTO) {
  id: number;
}
