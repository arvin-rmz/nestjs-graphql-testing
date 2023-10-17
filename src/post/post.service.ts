import { Injectable } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { PostCreateInput } from 'src/graphql';

import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorCode } from 'src/types/error.types';
import { UserService } from 'src/user/user.service';

class CustomError extends Error {
  extensions: {
    code: string;
  };

  constructor(message: string, extensions: { code: string }) {
    super(message);
    this.extensions = extensions;
  }
}

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(postCreateInput: PostCreateInput, currentUserId: number) {
    const post = await this.prisma.post.create({
      data: {
        title: postCreateInput.title,
        content: postCreateInput.content,
        userId: currentUserId,
      },
    });

    return {
      userErrors: [],
      post,
    };
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      // throw new GraphQLError(`Post with id: ${id} not found.`, {
      //   extensions: { code: ErrorCode.NOT_FOUND_ERROR },
      // });
      const customError = new CustomError(`Post with id: ${id} not found`, {
        code: ErrorCode.NOT_FOUND_ERROR,
      });
      // @ts-ignore
      // customError.code = ErrorCode.NOT_FOUND_ERROR;
      throw customError;
    }

    return post;
  }

  async findAll() {
    const posts = await this.prisma.post.findMany({});

    return posts;
  }

  async findAllByUserId(id: number) {
    const posts = await this.prisma.post.findMany({
      where: {
        id,
      },
    });

    return {
      userErrors: [],
      posts,
    };
  }
}
