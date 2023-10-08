import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
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
  controllers: [AppController],
  providers: [AppService, PrismaService, UserService],
})
export class AppModule {}
