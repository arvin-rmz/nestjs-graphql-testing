import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
// @ts-ignore
import { CreatePetInput, UpdatePetInput } from '../graphql';

import { PetsService } from './pets.service';

@Resolver('Pet')
export class PetsResolver {
  constructor(private readonly petsService: PetsService) {}

  @Mutation('createPet')
  create(@Args('createPetInput') createPetInput: CreatePetInput) {
    return this.petsService.create(createPetInput);
  }

  @Query('pets')
  findAll() {
    return this.petsService.findAll();
  }

  @Query('pet')
  findOne(@Args('id') id: number) {
    return this.petsService.findOne(id);
  }

  @Mutation('updatePet')
  update(@Args('updatePetInput') updatePetInput: UpdatePetInput) {
    return this.petsService.update(updatePetInput.id, updatePetInput);
  }

  @Mutation('removePet')
  remove(@Args('id') id: number) {
    return this.petsService.remove(id);
  }
}
