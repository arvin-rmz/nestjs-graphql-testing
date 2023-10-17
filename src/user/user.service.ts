import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from 'prisma/prisma-client';
import { CreateUserInput } from 'src/graphql';
import { CustomError } from 'src/errors/custom-error';
import { ErrorCode } from 'src/types/error.types';

import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestError } from 'src/errors/bad-request.error';
import { UserExistError } from 'src/errors/user-exist.error';
@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    const users = await this.prismaService.user.findMany({
      select: {
        password: false,
        email: true,
        createdAt: true,
        firstName: true,
        posts: true,
        id: true,
      },
    });

    return users;
  }

  async findUOne(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    const { password, ...restUser } = user;

    return restUser;
  }

  async findByEmail(email: string): Promise<User> | null {
    const user = this.prismaService.user.findFirst({ where: { email } });

    if (!user) return null;

    return user;
  }

  async create(createUserInput: CreateUserInput) {
    try {
      const { password, ...createdUser } = await this.prismaService.user.create(
        {
          data: {
            firstName: createUserInput.firstName,
            lastName: createUserInput.lastName,
            email: createUserInput.email,
            password: createUserInput.password,
          },
        },
      );

      return createdUser;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new UserExistError(
          `User ${createUserInput.email} already exists`,
        );
      }
    }
  }

  async getByProfileId(profileId: number) {
    const profile = await this.prismaService.profile.findFirst({
      where: {
        id: profileId,
      },
      select: {
        user: true,
      },
    });

    return profile.user;
  }

  async getAllByBatch(ids: number[]) {
    const users = await this.prismaService.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return this._sortUsersByIds(users, ids);
  }

  private _sortUsersByIds(users: User[], ids: number[]) {
    const userMap: Record<string, User> = {};

    users.forEach((user) => {
      userMap[user.id] = user;
    });

    return ids.map((id) => userMap[id]);
  }
}
