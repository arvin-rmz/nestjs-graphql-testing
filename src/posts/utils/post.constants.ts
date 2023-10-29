export const allowedDocumentsFormats = ['PPT', 'PPTX', 'DOC', 'DOCX', 'PDF'];

export const allowedImagesFormats = ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'];

export const allowedVideosFormats = [
  'MP4',
  'MOV',
  'AVI',
  'WEBM',
  'MKV',
  'WMV',
  'VC1',
  'MPEG',
  'MPEG2',
  'MPEG1',
  'DVVIDEO',
  'QTRLE',
  'TSCC2',
];

export const allowedFilesFormats = [
  ...allowedDocumentsFormats,
  ...allowedImagesFormats,
  ...allowedVideosFormats,
];
