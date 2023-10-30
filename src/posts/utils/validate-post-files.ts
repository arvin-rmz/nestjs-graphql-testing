import { BadRequestError } from 'src/errors/bad-request.error';
import { Upload } from '../dto/post-create-files-input';
import { allowedDocumentsFormats, allowedFilesFormats } from './post.constants';
import { ReadStream } from 'fs';

export const validatePostFiles = async (files: Upload[]) => {
  if (typeof files === 'undefined') return;

  const filesFormatIsValid = validatePostFilesFormat(
    files,
    allowedFilesFormats,
  );
  if (!filesFormatIsValid)
    throw new BadRequestError(
      `Invalid files format. Allowed formats are: ${allowedFilesFormats.join(
        ', ',
      )}`,
    );

  const validateFilesSizePromises = files.map((file) =>
    validatePostFileSize(file?.file?.createReadStream(), 10000000),
  );

  const validateFilesSizeResult = await Promise.all(validateFilesSizePromises);

  if (validateFilesSizeResult.includes(false))
    throw new BadRequestError('Invalid files size');

  return true;
};

export const validatePostFilesFormat = (
  files: Upload[],
  allowedFileFormats: string[],
) => {
  let filesFormatIsValid = true;

  files.forEach((file) => {
    if (typeof file === 'string')
      throw new BadRequestError(
        "Invalid files format. If you don't want to send files please provide an empty array or remove the files field entirely",
      );

    if (!file.file) return;

    const fileName = file.file.filename;
    const splittedFile = fileName.split('.');
    const extension = splittedFile[splittedFile.length - 1];

    if (
      allowedDocumentsFormats.includes(extension.toUpperCase()) &&
      files.length > 1
    )
      throw new BadRequestError('Only one file as Document can be send.');

    if (!allowedFileFormats.includes(extension.toUpperCase())) {
      filesFormatIsValid = false;
    }
  });

  return filesFormatIsValid;
};

export const validatePostFileSize = async (
  fileStream: ReadStream,
  allowedFileSizeInBytes: number,
) => {
  return new Promise((resolve, reject) => {
    let fileSizeInBytes = 0;

    if (typeof fileStream !== 'object') resolve(true);

    fileStream
      .on('data', (data: Buffer) => {
        fileSizeInBytes += data.length;
      })
      .on('end', () => {
        // console.log(Math.round(fileSizeInBytes / 1024), 'fileBytesss');
        resolve(fileSizeInBytes <= allowedFileSizeInBytes);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

export const validateFileSize = async (
  fileStream: ReadStream,
  allowedFileSizeInBytes: number,
) => {
  return new Promise((resolve, reject) => {
    let fileSizeInBytes = 0;

    fileStream
      .on('data', (data: Buffer) => {
        fileSizeInBytes += data.byteLength;
      })
      .on('end', () => {
        resolve(fileSizeInBytes <= allowedFileSizeInBytes);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};
