import { Injectable } from '@nestjs/common';
import { Post, PostCreateInput, PostPayload, User } from 'src/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

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
        userId: 1,
      },
    });
    // const { user } = await this.userService.findOne(currentUserId);

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

    return post;
  }

  async findAll() {
    const posts = await this.prisma.post.findMany({});

    return posts;
  }

  async findUserPosts(id: number) {
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
