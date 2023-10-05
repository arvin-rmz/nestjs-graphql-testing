import { Injectable } from '@nestjs/common';
import { PostCreateInput, PostPayload, User } from 'src/graphql';
// import { PostCreateInput } from 'src/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(postCreateInput: PostCreateInput): Promise<PostPayload> {
    console.log(postCreateInput, 'create');
    try {
      const post = await this.prisma.post.create({
        data: {
          title: postCreateInput.title,
          content: postCreateInput.content,
          userId: 1,
        },
      });
      return {
        userErrors: [],
        Post: {
          ...post,
          user: {
            id: 2,
            email: 'asdf@asdf.com',
            firstName: 'user',
          },
        },
      };
    } catch (error) {
      console.log(error);
    }
  }
}
