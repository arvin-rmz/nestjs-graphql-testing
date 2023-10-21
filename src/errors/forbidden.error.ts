import { ErrorCode } from 'src/types/error.types';
import { CustomError } from './custom-error';

export class ForbiddenError extends CustomError {
  constructor(message?: string) {
    super(message ?? 'Forbidden', {
      code: ErrorCode.UNAUTHORIZED,
    });
  }
}
