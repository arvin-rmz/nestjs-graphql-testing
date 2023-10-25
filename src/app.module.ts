import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLFormattedError } from 'graphql';
import { ConfigModule } from '@nestjs/config';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { PrismaModule } from './prisma/prisma.module';
import { PetsModule } from './pet/pets.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';
import { ProfilesModule } from './profiles/profiles.module';
import { DataloaderModule } from './dataloader/dataloader.module';
import { DataLoaderService } from './dataloader/dataloader.service';
import { ErrorCode } from './types/error.types';
import { RedisModule } from './redis/redis.module';

export interface IOriginalError {
  message: Partial<string[] & { field: string; message: string }[]>;
  error: string;
  statusCode: number;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataloaderModule],
      useFactory: (dataLoaderService: DataLoaderService) => {
        return {
          typePaths: ['./**/*.graphql'],
          playground: false,
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
          definitions: {
            path: join(process.cwd(), 'src/graphql.ts'),
            outputAs: 'class',
          },

          formatError: (error: any) => {
            interface ICustomError extends GraphQLFormattedError {
              code?: string;
              field?: string;
            }
            console.log('error');

            // return error;

            let graphQLFormattedError: ICustomError;
            if (error.message.startsWith('Cannot query field')) {
              graphQLFormattedError = {
                code: ErrorCode.GRAPHQL_VALIDATION_FAILED,
                message: error.message,
                // message: 'Cannot query field',
              };
              return graphQLFormattedError;
            }

            if (error?.extensions?.field) {
              const field = error.extensions.field;
              const message = error.message;
              const code = error.extensions.code as string;

              graphQLFormattedError = {
                code,
                message,
                field,
              };

              return graphQLFormattedError;
            }

            if (error?.extensions?.originalError?.statusCode === 400) {
              const originalError: IOriginalError = error?.extensions
                ?.originalError as IOriginalError;

              const field = originalError.message[0].field;
              const message =
                originalError.message[0].message || originalError.message[0];
              const code = error?.extensions.code as string;

              graphQLFormattedError = {
                code,
                message,
                field,
              };

              return graphQLFormattedError;
            }

            if (
              error?.extensions.code === ErrorCode.GRAPHQL_VALIDATION_FAILED
            ) {
              graphQLFormattedError = {
                code: error?.extensions.code as string,
                message: 'Input is not valid',
              };

              return graphQLFormattedError;
            }

            graphQLFormattedError = {
              code: error?.extensions.code as string,
              message: error.message,
            };

            return graphQLFormattedError;
            return error;
          },

          context: () => ({
            loaders: dataLoaderService.getLoaders(),
          }),
        };
      },
      inject: [DataLoaderService],
    }),

    PrismaModule,
    PetsModule,
    UsersModule,
    PostsModule,
    AuthModule,
    ProfilesModule,
    DataloaderModule,
    RedisModule,
  ],
  providers: [PrismaService, UsersService],
})
export class AppModule {}
