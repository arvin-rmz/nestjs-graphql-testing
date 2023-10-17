import { ErrorCode } from 'src/types/error.types';
import { CustomError } from './custom-error';

export class UserExistError extends CustomError {
  constructor(message?: string) {
    super(message ?? 'User already exist.', {
      code: ErrorCode.USER_ALREADY_EXIST,
    });
  }
}
