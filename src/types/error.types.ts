import { ApolloServerErrorCode } from '@apollo/server/errors';

export enum ErrorCodeEnum {
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  USER_ALREADY_EXIST = 'USER_ALREADY_EXIST',
  UNAUTHORIZED = 'UNAUTHORIZED',
}
export const ErrorCode = { ...ErrorCodeEnum, ...ApolloServerErrorCode };
