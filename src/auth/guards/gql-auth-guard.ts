import {
  ExecutionContext,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { validateAuthBodyAndParseErrors } from '../utils/auth-input.validation';
import { BadRequestError } from 'src/errors/bad-request.error';
import { ErrorCode } from 'src/types/error.types';

@Injectable()
export class GqlAuthGuard extends AuthGuard('local') {
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext();

    request.body = ctx.getArgs()?.loginInput;

    return request;
  }
}
