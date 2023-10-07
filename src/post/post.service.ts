import { Injectable } from '@nestjs/common';
import { PostCreateInput, PostPayload, PostsPayload, User } from 'src/graphql';
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
    const { user } = await this.userService.findOne(currentUserId);

    return {
      userErrors: [],
      post: {
        ...post,
        user,
      },
    };
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
    });

    return {
      userErrors: [],
      post,
    };
  }

  async findAll(): Promise<PostsPayload> {
    const posts = await this.prisma.post.findMany({});

    return {
      userErrors: [],
      posts,
    } as unknown as PostsPayload;
  }

  async findUserPosts(id: number): Promise<PostsPayload> {
    const posts = await this.prisma.post.findMany({
      where: {
        id,
      },
    });

    return {
      userErrors: [],
      posts,
    } as unknown as PostsPayload;
  }
}
