import DataLoader from 'dataloader';
import { User, File } from 'prisma/prisma-client';

// REFERENCE ==> https://blog.logrocket.com/use-dataloader-nestjs/

export interface IDataloaders {
  userLoader: DataLoader<number, User>;
  // filesLoader: DataLoader<number, File>;
}
