import DataLoader from 'dataloader';
import { User } from 'prisma/prisma-client';

// REFERENCE ==> https://blog.logrocket.com/use-dataloader-nestjs/

export interface IDataloaders {
  userLoader: DataLoader<number, User>;
}
