import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LiaraFileStorageService } from 'src/liara-file-storage/liara-file-storage.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorCode } from 'src/types/error.types';
import { UsersService } from 'src/users/users.service';
import { Upload } from './dto/post-create-files-input';
import { CustomError } from 'src/errors/custom-error';
import { FileType } from 'prisma/prisma-client';
import { getFileFormat, getFileType } from './utils/file.utils';

interface ICreatePostParam {
  title: string;
  content: string;
  files: Upload[];
}

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly liaraFileStorage: LiaraFileStorageService,
  ) {}

  async create(createPostParam: ICreatePostParam, currentUserId: number) {
    const { title, content, files } = createPostParam;

    try {
      const post = await this.prisma.post.create({
        data: {
          title: title,
          content: content,
          userId: currentUserId,
        },
      });

      const uploadedFilesList = await this.liaraFileStorage.uploadFiles(files);

      const filesToCreate = uploadedFilesList.map((uploadedFile) => ({
        url: this._createPostImageUrl(uploadedFile.path),
        index: uploadedFile.index,
        postId: post.id,
        type: uploadedFile.fileType,
      }));

      const createdFiles = await this.prisma.file.createMany({
        data: filesToCreate,
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
    const posts = await this.prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

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
    const files = await this.prisma.file.findMany({
      where: {
        postId,
      },
      orderBy: {
        index: 'asc',
      },
    });

    const response = files.map((file) => {
      return {
        mimetype: '.png',
        filename: file.url,
        encoding: 'e',
        url: file.url,
        index: file.index,
        type: file.type,
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
