import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
// import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
// import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
// import { graphqlUploadExpress } from 'graphql-upload';
// import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { graphqlUploadExpress } from 'graphql-upload';
import * as multer from 'multer';
import { setupApp } from './setup-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isDevelopment = process.env.NODE_ENV === 'development';
  setupApp(app);

  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 2000000000, maxFiles: 10 }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(
    helmet({
      crossOriginEmbedderPolicy: !isDevelopment,
      contentSecurityPolicy: !isDevelopment,
    }),
  );
  await app.listen(process.env.PORT || 5000, () =>
    console.log(`Server started on port: ${process.env.PORT}`),
  );
}
bootstrap();
