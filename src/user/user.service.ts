import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateUserInput, UserPayload, UsersPayload } from 'src/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findAll(): Promise<UsersPayload> {
    const users = await this.prismaService.user.findMany({
      select: {
        password: false,
        email: true,
        createdAt: true,
        firstName: true,
        posts: true,
      },
    });

    return {
      userErrors: [],
      users,
    } as unknown as UsersPayload;
  }

  async findOne(id: number): Promise<UserPayload> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      return {
        userErrors: [
          {
            message: `User not found.`,
          },
        ],
        user: null,
      };
    }

    const { password, ...restUser } = user;

    return {
      userErrors: [],
      user: restUser,
    } as unknown as UsersPayload;
  }

  async create(createUserInput: CreateUserInput): Promise<UserPayload> {
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
      return {
        userErrors: [],
        user: createdUser,
      } as unknown as UserPayload;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `User ${createUserInput.email} already exists`,
        );
      }
    }
  }

  async getUserByProfileId(profileId: number) {
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
}
