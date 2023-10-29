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

  async getObject() {
    const params = {
      // Body: binaryString,
      Bucket: this.configService.get('LIARA_BUCKET_NAME'),
      Key: 'objectKey',
    };

    try {
      const data = await this.client.send(new GetObjectCommand(params));
      console.log(data.Body.toString());
      return data.Body.toString();
    } catch (error) {
      console.log(error);
    }
  }

  async uploadFiles(files: any[]) {
    const uploadedFilesList: { index: number; path: string }[] = [];

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

        uploadedFilesList.push({ path, index });

        const liaraResponse = await this.uploadObject(imageBuffer, path);

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

  private _formatUrl(url: string): string {
    url = url.replace(/ /g, '');

    url = url.toLowerCase();

    url = url.replace(/_/g, '-');

    return url;
  }
}
