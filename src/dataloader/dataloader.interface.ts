import DataLoader from 'dataloader';
import { User } from 'prisma/prisma-client';

import { File as GraphqlFileType } from 'src/graphql';

// REFERENCE ==> https://blog.logrocket.com/use-dataloader-nestjs/

export interface IDataloaders {
  userLoader: DataLoader<number, User>;
  postFilesLoader: DataLoader<number, GraphqlFileType[]>;
}
