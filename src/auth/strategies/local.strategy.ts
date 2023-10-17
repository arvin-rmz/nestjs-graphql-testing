import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { BadRequestError } from 'src/errors/bad-request.error';
import { validateAuthBodyAndParseErrors } from '../utils/auth-input.validation';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const authInputValidation = await validateAuthBodyAndParseErrors({
      email,
      password,
    });

    if (authInputValidation?.field) {
      throw new BadRequestError(authInputValidation.message, {
        field: authInputValidation.field,
      });
    }

    const user = await this.authService.validateUser(email, password);

    if (!user) throw new BadRequestError('Invalid email or password');

    return user;
  }
}
