import { Module } from '@nestjs/common';

import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [ProfileResolver, ProfileService, UserService],
})
export class ProfileModule {}
