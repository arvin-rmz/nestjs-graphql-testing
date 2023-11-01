import { ReadStream } from 'fs';

class File {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => ReadStream;
}

export class Upload {
  resolve: Function;
  reject: Function;
  promise: Promise<any>;
  file: File;
}

// Should use interface instead of class to prevent transforming input data to undefined
export interface PostCreateFilesInput {
  files: Upload[];
}

// const postCreateInput = {
//   title: 'Title 222',
//   content: 'Content 222',
//   files: [
//     {
//       resolve: Function,
//       reject: Function,
//       promise: Promise<any>,
//       file: [
//         {
//           filename: 'woman-profile-image-1.jpg',
//           mimetype: 'application/octet-stream',
//           encoding: '7bit',
//           createReadStream: ReadStream,
//         },
//       ],
//     },
//   ],
// };
