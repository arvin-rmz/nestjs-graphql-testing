import {
  ValidationPipe,
  BadRequestException,
  INestApplication,
} from '@nestjs/common';

export const setupApp = (app: INestApplication<any>) => {
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          field: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));

        return new BadRequestException(result);
      },

      stopAtFirstError: true,
    }),
  );
};
