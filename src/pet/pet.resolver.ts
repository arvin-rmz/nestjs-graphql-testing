import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
// @ts-ignore
import { CreatePetInput, UpdatePetInput } from '../graphql';

import { PetService } from './pet.service';
import { CreatePetInputDTO } from './dto/create-pet.input';

@Resolver('Pet')
export class PetResolver {
  constructor(private readonly petService: PetService) {}

  @Mutation('createPet')
  create(@Args('createPetInput') createPetInput: CreatePetInput) {
    return this.petService.create(createPetInput);
  }

  @Query('pets')
  findAll() {
    return this.petService.findAll();
  }

  @Query('pet')
  findOne(@Args('id') id: number) {
    return this.petService.findOne(id);
  }

  @Mutation('updatePet')
  update(@Args('updatePetInput') updatePetInput: UpdatePetInput) {
    return this.petService.update(updatePetInput.id, updatePetInput);
  }

  @Mutation('removePet')
  remove(@Args('id') id: number) {
    return this.petService.remove(id);
  }
}
