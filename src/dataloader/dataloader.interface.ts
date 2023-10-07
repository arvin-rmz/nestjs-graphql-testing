import DataLoader from 'dataloader';
import { User } from 'src/graphql';

// https://blog.logrocket.com/use-dataloader-nestjs/

export interface IDataloaders {
  usersLoader: DataLoader<number, User>;
}
