import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LiaraFileStorageService } from 'src/liara-file-storage/liara-file-storage.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorCode } from 'src/types/error.types';
import { UsersService } from 'src/users/users.service';

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
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly liaraFileStorage: LiaraFileStorageService,
  ) {}

  async create(
    postCreateInput: { title: string; content: string; files: any[] },
    currentUserId: number,
  ) {
    const { title, content, files } = postCreateInput;

    try {
      const post = await this.prisma.post.create({
        data: {
          title: title,
          content: content,
          userId: currentUserId,
        },
      });

      const uploadedFilesList = await this.liaraFileStorage.uploadFiles(files);

      const imagesToCreate = uploadedFilesList.map((uploadedFile) => ({
        url: this._createPostImageUrl(uploadedFile.path),
        index: uploadedFile.index,
        postId: post.id,
      }));

      const images = await this.prisma.image.createMany({
        data: imagesToCreate,
      });

      return {
        userErrors: [],
        post,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        images: {
          where: {
            postId: id,
          },
        },
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
    console.log(post);
    return {
      ...post,
      image: post.images[0].url,
    };
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

  async getPostFiles(postId: number) {
    const images = await this.prisma.image.findMany({
      where: {
        postId,
      },
    });

    const response = images.map((image) => {
      return {
        mimetype: '.png',
        filename: image.url,
        encoding: 'e',
        url: image.url,
        index: image.index,
      };
    });

    return response;
  }

  private _createPostImageUrl(path: string) {
    // https://a-plus-web-uploads.storage.iran.liara.space/1/average-salary.png

    const endPoint = this.configService
      .get('LIARA_ENDPOINT')
      .split('https://')[1];

    const bucketName = this.configService.get('LIARA_BUCKET_NAME');

    return `https://${bucketName}.${endPoint}/${path}`;
  }
}
