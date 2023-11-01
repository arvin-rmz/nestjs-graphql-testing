import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { File } from 'prisma/prisma-client';

import { LiaraFileStorageService } from 'src/liara-file-storage/liara-file-storage.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorCode } from 'src/types/error.types';
import { UsersService } from 'src/users/users.service';
import { FileType, File as GraphqlFileType } from 'src/graphql';
import { Upload } from './dto/post-create-files-input';
import { CustomError } from 'src/errors/custom-error';

interface ICreatePostParam {
  title: string;
  content: string;
  files?: Upload[];
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

    const post = await this.prisma.post.create({
      data: {
        title: title,
        content: content,
        userId: currentUserId,
      },
    });

    const uploadedFilesList = await this.liaraFileStorage.uploadFiles(files);

    const filesToCreate = uploadedFilesList?.map((uploadedFile) => ({
      url: this._createPostImageUrl(uploadedFile.path),
      index: uploadedFile.index,
      postId: post.id,
      type: uploadedFile.fileType,
    }));

    filesToCreate &&
      (await this.prisma.file.createMany({
        data: filesToCreate,
      }));

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
      include: {
        images: {
          where: {
            postId: id,
          },
        },
      },
    });

    if (!post) {
      const customError = new CustomError(`Post with id: ${id} not found`, {
        code: ErrorCode.NOT_FOUND_ERROR,
      });

      throw customError;
    }

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

  // async getPostFiles(postId: number): Promise<ResponseFileType[]> {
  //   const files = await this.prisma.file.findMany({
  //     where: {
  //       postId,
  //     },
  //     orderBy: {
  //       index: 'asc',
  //     },
  //   });

  //   const response = files.map((file) => {
  //     return {
  //       mimetype: '.png',
  //       filename: file.url,
  //       encoding: 'e',
  //       url: file.url,
  //       index: file.index,
  //       type: file.type as FileType,
  //     };
  //   });

  //   return response;
  // }

  async getAllByBatch(postIds: number[]) {
    const files = await this.prisma.file.findMany({
      where: {
        postId: {
          in: postIds,
        },
      },
      orderBy: {
        index: 'asc',
      },
    });

    return this._sortPostFilesByIds(files, postIds);
  }

  private _sortPostFilesByIds(
    files: File[],
    postIds: number[],
  ): GraphqlFileType[][] {
    const fileMap: Record<string, GraphqlFileType[]> = {};

    files.forEach((file) => {
      const fileResponse: GraphqlFileType = {
        encoding: 'e',
        mimetype: '.example',
        filename: file.url,
        type: file.type as FileType,
        index: file.index,
        url: file.url,
      };

      if (fileMap[file.postId]) {
        fileMap[file.postId] = [...fileMap[file.postId], fileResponse];
      } else {
        fileMap[file.postId] = [fileResponse];
      }
    });

    const sortedPostFilesByPostIds = postIds.map(
      (postId) => fileMap[postId] || [],
    );

    return sortedPostFilesByPostIds;
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
