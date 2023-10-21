import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { LocalStrategy } from './strategies/local.strategy';
import { AtJwtStrategy } from './strategies/at-jwt.strategy';
import { RtJwtStrategy } from './strategies/rt-jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    UsersModule,
    RedisModule,

    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],

  providers: [
    AuthResolver,
    AuthService,
    AtJwtStrategy,
    RtJwtStrategy,
    LocalStrategy,
  ],
})
export class AuthModule {}
