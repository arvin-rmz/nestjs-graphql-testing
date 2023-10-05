import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateUserInput, UserPayload, UsersPayload } from 'src/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<UsersPayload> {
    const users = await this.prisma.user.findMany({
      select: {
        password: false,
        email: true,
        id: true,
        createdAt: true,
        firstName: true,
      },
    });

    return {
      userErrors: [],
      users,
    };
  }

  async findOne(email: string): Promise<UserPayload> {
    const { password, ...user } = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        userErrors: [
          {
            message: `User ${email} does not exist.`,
          },
        ],
        user: null,
      };
    }

    return {
      userErrors: [],
      user,
    };
  }

  async create(createUserInput: CreateUserInput): Promise<UserPayload> {
    try {
      const { password, ...user } = await this.prisma.user.create({
        data: {
          firstName: createUserInput.firstName,
          lastName: createUserInput.lastName,
          email: createUserInput.email,
          password: createUserInput.password,
        },
      });

      return {
        userErrors: [],
        user,
      };
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
}
