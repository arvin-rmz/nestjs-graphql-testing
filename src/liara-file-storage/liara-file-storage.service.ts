import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

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
    const imagePathList: string[] = [];

    const uploadFilesPromises = files.map(async (file: any) => {
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

        const imagePath = `${randomUUID()}.${decodeURIComponent(
          formattedPath,
        )}`;

        imagePathList.push(imagePath);

        const liaraResponse = await this.uploadObject(imageBuffer, imagePath);

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

    await Promise.all(uploadFilesPromises);

    return imagePathList;
  }

  async uploadObject(binaryString: Buffer, objectKey?: string): Promise<any> {
    const params = {
      Body: binaryString,
      Bucket: this.configService.get('LIARA_BUCKET_NAME'),
      Key: objectKey,
    };

    try {
      return await this.client.send(new PutObjectCommand(params));
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
