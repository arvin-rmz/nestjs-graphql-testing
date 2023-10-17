import { ErrorCode } from 'src/types/error.types';
import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  constructor(message?: string, extensions?: { field: string }) {
    super(message ?? 'Bad Request', {
      code: ErrorCode.BAD_REQUEST,
      field: extensions?.field || null,
    });
  }
}
