import { GraphQLExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { User } from 'prisma/prisma-client';

import { IJwtUserPayload } from 'src/auth/strategies/at-jwt.strategy';

interface IGraphQLRequestContext extends Request {
  user?: IJwtUserPayload;
}

export interface IGraphQLContext extends GraphQLExecutionContext {
  user?: Omit<User, 'password'>;
  req: IGraphQLRequestContext;
  res: Response;
}
