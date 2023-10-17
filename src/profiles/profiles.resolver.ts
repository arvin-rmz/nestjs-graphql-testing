import {
  Resolver,
  Query,
  Mutation,
  Args,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { Profile } from 'src/graphql';

import { ProfilesService } from './profiles.service';
import { CreateProfileInput } from './dto/create-profile.input';
import { UsersService } from 'src/users/users.service';

@Resolver('Profile')
export class ProfilesResolver {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation('profileCreate')
  createProfile(
    @Args('createProfileInput') createProfileInput: CreateProfileInput,
  ) {
    return this.profilesService.create(createProfileInput);
  }

  @Query('profiles')
  getAllProfiles() {
    return this.profilesService.findAll();
  }

  @Query('profile')
  getProfile(@Args('id') id: string) {
    return this.profilesService.findOne(Number(id));
  }

  @ResolveField('user')
  async getUser(@Parent() profile: Profile) {
    return this.usersService.getByProfileId(Number(profile.id));
  }
}
