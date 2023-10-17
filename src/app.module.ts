import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { ConfigModule } from '@nestjs/config';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PetModule } from './pet/pet.module';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { AuthModule } from './auth/auth.module';
import { UserService } from './user/user.service';
import { ProfileModule } from './profile/profile.module';
import { DataloaderModule } from './dataloader/dataloader.module';
import { DataLoaderService } from './dataloader/dataloader.service';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { ErrorCode } from './types/error.types';

export interface IOriginalError {
  message: Partial<string[] & { field: string; message: string }[]>;
  error: string;
  statusCode: number;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

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
                message: 'Cannot query field',
              };
              return graphQLFormattedError;
            }

            if (error?.extensions?.field) {
              const field = error.extensions.field;
              const message = error.message;
              const code = error.extensions.code as string;
              console.log(error.message);
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
    PetModule,
    UserModule,
    PostModule,
    AuthModule,
    ProfileModule,
    DataloaderModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },

    PrismaService,
    UserService,
  ],
})
export class AppModule {}
