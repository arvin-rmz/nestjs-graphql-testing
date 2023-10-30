import { FileType } from 'prisma/prisma-client';
import {
  allowedDocumentsFormats,
  allowedImagesFormats,
  allowedVideosFormats,
} from './post.constants';

export const getFileType = (fileName: string): FileType => {
  const splittedFile = fileName.split('.');
  const fileFormat = splittedFile[splittedFile.length - 1];

  let type: string;

  if (isImage(fileFormat)) return FileType.IMAGE;
  if (isVideo(fileFormat)) return FileType.VIDEO;
  if (isDocument(fileFormat)) return FileType.DOCUMENT;
};

export const getFileFormat = (fileName: string): string => {
  const splittedFile = fileName.split('.');
  const extension = splittedFile[splittedFile.length - 1];

  return extension;
};

export const isImage = (fileFormat: string): boolean => {
  return allowedImagesFormats.includes(fileFormat.toUpperCase());
};

export const isVideo = (fileFormat: string): boolean => {
  return allowedVideosFormats.includes(fileFormat.toUpperCase());
};

export const isDocument = (fileFormat: string): boolean => {
  return allowedDocumentsFormats.includes(fileFormat.toUpperCase());
};
