import { ApolloServerErrorCode } from '@apollo/server/errors';

// export const ErrorCode = {
//   notFound: 'NOT_FOUND',
//   internalServerError: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
// };

export enum ErrorCodeEnum {
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  USER_ALREADY_EXIST = 'USER_ALREADY_EXIST',
}
export const ErrorCode = { ...ErrorCodeEnum, ...ApolloServerErrorCode };
