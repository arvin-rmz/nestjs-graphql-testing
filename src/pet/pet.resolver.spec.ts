import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CreatePetInput, UpdatePetInput } from 'src/graphql';
import { PetService } from './pet.service';

@Resolver('Pet')
export class PetResolver {
  constructor(private readonly petService: PetService) {}

  @Mutation('createPet')
  create(@Args('createPetInput') createPetInput: CreatePetInput) {
    return this.petService.create(createPetInput);
  }

  @Query('pets')
  findAll() {
    console.log('first');
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
