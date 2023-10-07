import { Injectable } from '@nestjs/common';
import { CreateProfileInput } from './dto/create-profile.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prismaService: PrismaService,

    private readonly userService: UserService,
  ) {}

  create(createProfileInput: CreateProfileInput) {
    return 'This action adds a new profile';
  }

  async findAll() {
    const profileList = await this.prismaService.profile.findMany();

    return {
      userErrors: [],
      profiles: profileList,
    };
  }

  async findOne(id: number) {
    const profile = await this.prismaService.profile.findUnique({
      where: {
        id,
      },
    });

    if (!profile)
      return {
        userErrors: [
          {
            message: 'Profile not found.',
          },
        ],
        profile: null,
      };

    return {
      userErrors: [],
      profile,
    };
  }

  update(id: number, updateProfileInput: UpdateProfileInput) {
    return `This action updates a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}