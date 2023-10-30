import { UseGuards } from '@nestjs/common';
import { Post } from 'prisma/prisma-client';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { createWriteStream } from 'fs';
// import { GraphQLUpload, FileUpload } from 'graphql-upload';
// import { GraphQLUpload } from 'graphql-upload';

import { PostsService } from './posts.service';
import { PostCreateInputDTO } from './dto/post-create-input';
import { AtAuthGuard } from 'src/auth/guards/at-auth-guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { IJwtUserPayload } from 'src/auth/strategies/at-jwt.strategy';
import { IDataloaders } from 'src/dataloader/dataloader.interface';

import { LiaraFileStorageService } from 'src/liara-file-storage/liara-file-storage.service';
import { PostCreateFilesInput } from './dto/post-create-files-input';
import {
  validatePostFiles,
  validatePostFilesFormat,
} from './utils/validate-post-files';
import { BadRequestError } from 'src/errors/bad-request.error';
import { allowedFilesFormats } from './utils/post.constants';

interface Upload {
  Upload: {
    resolve: Function;
    reject: Function;
    promise: Promise<any>;
    file: object;
  };
}

@Resolver('Post')
export class PostsResolver {
  constructor(private readonly postService: PostsService) {}

  @Mutation('postCreate')
  @UseGuards(AtAuthGuard)
  async postCreate(
    @Args('postCreateInput') postCreateInput: PostCreateInputDTO,
    @Args('postCreateInput') { files }: PostCreateFilesInput,
    @CurrentUser() currentUser: IJwtUserPayload,
  ) {
    const currentUserId = Number(currentUser.sub);

    try {
      await validatePostFiles(files);

      return this.postService.create(
        { ...postCreateInput, files: files || [] },
        currentUserId,
      );
    } catch (error) {
      console.log(error, 'postCreate Mutation');
    }
  }

  // @Mutation('postCreate')
  // @UseGuards(AtAuthGuard)
  // postCreate(
  //   @Args('postCreateInput') postCreateInput: PostCreateInputDTO,
  //   @CurrentUser() currentUser: IJwtUserPayload,
  // ) {
  //   const currentUserId = Number(currentUser.sub);

  //   console.log(postCreateInput, 'postCreateInput');

  //   return this.postService.create(postCreateInput, currentUserId);
  // }

  @Mutation('fileUpload')
  async fileUpload(
    @Args('files') postCreateInput: any,
    // @Args('file', { type: () => GraphQLUpload }) file: Promise<any>,
  ) {
    console.log(postCreateInput.files, 'postCreateInput');

    return true;
  }

  @Query('post')
  getPost(@Args('id') id: string) {
    return this.postService.findOne(Number(id));
  }

  @Query('posts')
  getAllPosts() {
    return this.postService.findAll();
  }

  @ResolveField('user')
  getUser(
    @Parent() { userId }: Post,
    @Context() { loaders }: { loaders: IDataloaders },
  ) {
    return loaders.userLoader.load(Number(userId));
  }

  @ResolveField('files')
  getFiles(
    @Parent() { id }: Post,
    @Context() { loaders }: { loaders: IDataloaders },
  ) {
    // return loaders.userLoader.load(Number(userId));
    return this.postService.getPostFiles(id);
  }

  // @Mutation('postCreate')
  // @UseGuards(AtAuthGuard)
  // async postCreate(
  //   @Args('postCreateInput') postCreateInput: any,
  //   @CurrentUser() currentUser: IJwtUserPayload,
  // ) {
  //   const currentUserId = Number(currentUser.sub);
  //   const files = await postCreateInput.files;

  //   // console.log(typeof postCreateInput.files[0], 'filefile');
  //   const { title, content } = postCreateInput;
  //   // console.log(postCreateInput, 'postCreateInput');

  //   // const imagesChunks: any[] = [];

  //   // postCreateInput.files.foreEach((file: object) => {

  //   // });

  //   const imagePathList: string[] = [];

  //   const uploadPromises = files.map(async (file: Promise<FileUpload>) => {
  //     const fileResolved = await file;
  //     const { filename, mimetype, encoding } = fileResolved;

  //     console.log(await file, 'liaraFileStorageeeeeeeeeeeeeeeee');

  //     if (typeof fileResolved.createReadStream === 'function') {
  //       const stream = fileResolved.createReadStream();
  //       const chunks: Buffer[] = [];

  //       for await (const chunk of stream) {
  //         chunks.push(chunk);
  //       }

  //       const imageBuffer = Buffer.concat(chunks);
  //       const imagePath = `${currentUser.sub}/${filename}`;
  //       imagePathList.push(imagePath);

  //       const liaraResponse = await this.liaraFileStorage.uploadObject(
  //         imageBuffer,
  //         imagePath,
  //       );

  //       console.log(liaraResponse, 'liaraFileStorage');

  //       return {
  //         filename,
  //         mimetype,
  //         encoding,
  //         liaraResponse, // Include the liaraResponse in the returned object
  //       }; // Return the result of each file upload
  //     } else {
  //       return {
  //         filename,
  //         mimetype,
  //         encoding,
  //       };
  //     }
  //   });

  //   // const { filename, mimetype, encoding, createReadStream } =
  //   //   await postCreateInput.file.file;

  //   // const stream = createReadStream();
  //   // const chunks: any[] = [];

  //   // for await (const chunk of stream) {
  //   //   chunks.push(chunk);
  //   // }

  //   // const imageBuffer = Buffer.concat(chunks);

  //   // const imagePath = `${currentUser.sub}/${filename}`;

  //   // const liaraResponse = await this.liaraFileStorage.uploadObject(
  //   //   imageBuffer,
  //   //   imagePath,
  //   // );

  //   // console.log(
  //   //   `${currentUser.sub}/${filename}`,
  //   //   'binaryStringggggggggggggggggggggggggggggggggggggg',
  //   // );

  //   // console.log(liaraResponse, 'respomsreeeeeeeeeeeeeeeee');

  //   // console.log(typeof file, 'file', file, createReadStream, filename);

  //   // Save the image file to the 'uploads' folder
  //   //  await new Promise(async (resolve, reject) =>
  //   //     createReadStream()
  //   //       .pipe(createWriteStream(`./uploads/${filename}`))
  //   //       .on('finish', () => resolve(true))
  //   //       .on('error', (err) => {
  //   //         console.log(err, 'error');
  //   //         reject(false);
  //   //       }),
  //   //   );

  //   try {
  //     const liaraResponses = await Promise.all(uploadPromises);

  //     // console.log(liaraResponses, 'upload responses');

  //     return this.postService.create(
  //       { title, content, images: imagePathList },
  //       currentUserId,
  //     );

  //     // Handle the array of liaraResponses as needed
  //   } catch (error) {
  //     console.log(error, 'overall');
  //     // Handle any storage errors here
  //     // throw new ApolloError('Failed to upload files');
  //   }

  //   // return this.postService.create(
  //   //   { title, content, image: `./uploads/` },
  //   //   currentUserId,
  //   // );
  // }
}
