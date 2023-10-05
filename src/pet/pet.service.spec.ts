import { Injectable } from '@nestjs/common';
import { CreatePetInput, UpdatePetInput } from 'src/graphql';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PetService {
  constructor(private prisma: PrismaService) {}

  create(createPetInput: CreatePetInput) {
    return this.prisma.pet.create({
      data: { name: createPetInput.name },
    });
  }

  findAll() {
    return this.prisma.pet.findMany();
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
