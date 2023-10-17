import { plainToClass } from 'class-transformer';
import { LoginInputDTO } from '../dto/login.input.dto';
import { validate } from 'class-validator';
import { BadRequestError } from 'src/errors/bad-request.error';
import { AuthPayload } from 'src/graphql';
import { ErrorCode } from 'src/types/error.types';

interface ICredentials {
  email: string;
  password: string;
}

interface IValidationError {
  field: string;
  message: string;
  index: number;
}

export const validateAuthBodyAndParseErrors = async (
  body: ICredentials,
): Promise<IValidationError | null> => {
  const bodyClass = plainToClass(LoginInputDTO, body);
  const errors = await validate(bodyClass);

  const flattedErrors = errors.flatMap(({ constraints, property }, index) =>
    Object.values(constraints).map((message) => ({
      field: property,
      message,
      index,
    })),
  );

  if (flattedErrors.length > 0) {
    const firstError = flattedErrors[0];

    return firstError;
  }

  return null;
};
