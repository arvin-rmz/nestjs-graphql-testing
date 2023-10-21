import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IJwtUserPayload } from 'src/auth/strategies/at-jwt.strategy';

export interface ICurrentUser {
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    return request.user as IJwtUserPayload;
  },
);
