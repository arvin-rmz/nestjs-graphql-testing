import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
      secret: process.env.JWT_SECRET,
    }),

    UserModule,
  ],
  providers: [AuthResolver, AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
