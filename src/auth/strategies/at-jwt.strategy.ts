import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface IJwtUserPayload {
  email: string;
  sub: number;
  iat: number;
  exp: number;
}

@Injectable()
export class AtJwtStrategy extends PassportStrategy(Strategy, 'access-token') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET_KEY'),
    });
  }

  validate(payload: IJwtUserPayload): IJwtUserPayload {
    return payload;
  }
}
