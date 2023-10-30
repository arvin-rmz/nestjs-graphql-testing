import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { CustomError } from 'src/errors/custom-error';
import { ErrorCode } from 'src/types/error.types';
import { getFileType } from 'src/posts/utils/file.utils';
import { FileType } from 'prisma/prisma-client';

interface IUploadedFiles {
  index: number;
  path: string;
  fileType: FileType;
}

@Injectable()
export class LiaraFileStorageService {
  private client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: 'default',
      endpoint: this.configService.get('LIARA_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get('LIARA_ACCESS_KEY'),
        secretAccessKey: this.configService.get('LIARA_SECRET_KEY'),
      },
    });
  }

  async uploadFiles(files: any[]) {
    const uploadedFilesList: IUploadedFiles[] = [];

    const uploadFilesPromises = files.map(async (file: any, index) => {
      const fileToUpload = await file.promise;
      const { filename, mimetype, encoding, createReadStream } = fileToUpload;

      if (createReadStream) {
        const stream = createReadStream();
        const chunks: Buffer[] = [];

        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        const imageBuffer = Buffer.concat(chunks);

        const formattedPath = this._formatUrl(filename);

        const path = `${randomUUID()}.${decodeURIComponent(formattedPath)}`;

        const liaraResponse = await this.uploadObject(imageBuffer, path);

        const fileType = getFileType(filename);

        uploadedFilesList.push({ path, index, fileType });

        return {
          filename: filename ?? '',
          mimetype: mimetype ?? '',
          encoding: encoding ?? '',
          liaraResponse,
        };
      } else {
        return {
          filename: '',
          mimetype: '',
          encoding: '',
        };
      }
    });

    try {
      await Promise.all(uploadFilesPromises);

      return uploadedFilesList;
    } catch (error) {
      throw new CustomError(`Liara server error: ${error.message}`, {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async uploadObject(binaryString: Buffer, objectKey?: string): Promise<any> {
    const params = {
      Body: binaryString,
      Bucket: this.configService.get('LIARA_BUCKET_NAME'),
      Key: objectKey,
    };

    // try {
    return await this.client.send(new PutObjectCommand(params));
    // } catch (error) {
    //   console.log(error);
    // }
  }

  async getObject() {
    const params = {
      // Body: binaryString,
      Bucket: this.configService.get('LIARA_BUCKET_NAME'),
      Key: 'objectKey',
    };

    try {
      const data = await this.client.send(new GetObjectCommand(params));
      return data.Body.toString();
    } catch (error) {
      console.log(error);
    }
  }

  private _formatUrl(url: string): string {
    url = url.replace(/ /g, '');

    url = url.toLowerCase();

    url = url.replace(/_/g, '-');

    return url;
  }
}
