import { Injectable } from '@nestjs/common';

import { CreatePetInput, PetPayload, UpdatePetInput } from '../graphql';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async create(createPetInput: CreatePetInput): Promise<PetPayload> {
    // console.log(createPetInput, 'pet created');
    try {
      const pet = await this.prisma.pet.create({
        data: { name: createPetInput.name },
      });
      // console.log(pet);
      return {
        userErrors: [],
        Pet: pet,
      };
    } catch (error) {
      console.log(error);
    }
    return;
  }

  findAll() {
    return this.prisma.pet.findMany({
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  findOne(id: number) {
    return this.prisma.pet.findUnique({
      where: { id },
    });
  }

  update(id: number, updatePetInput: UpdatePetInput) {
    return this.prisma.pet.update({
      where: { id },
      data: {
        name: updatePetInput.name,
      },
    });
  }

  remove(id: number) {
    return this.prisma.pet.delete({
      where: { id },
    });
  }
}
