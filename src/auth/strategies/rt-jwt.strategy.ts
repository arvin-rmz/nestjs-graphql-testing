import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtUserPayload } from './at-jwt.strategy';

@Injectable()
export class RtJwtStrategy extends PassportStrategy(Strategy, 'refresh-token') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET_KEY'),
    });
  }

  validate(payload: IJwtUserPayload): IJwtUserPayload {
    return { ...payload };
  }
}
