import { Injectable } from '@nestjs/common';

import { CreateProfileInput } from './dto/create-profile.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prismaService: PrismaService,

    private readonly usersService: UsersService,
  ) {}

  create(createProfileInput: CreateProfileInput) {
    return 'This action adds a new profile';
  }

  findAll() {
    return this.prismaService.profile.findMany();
  }

  async findOne(id: number) {
    const profile = await this.prismaService.profile.findUnique({
      where: {
        id,
      },
    });

    return profile;
  }

  update(id: number, updateProfileInput: UpdateProfileInput) {
    return `This action updates a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
