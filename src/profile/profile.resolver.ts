import { NotFoundException } from '@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { ProfileService } from './profile.service';
import { CreateProfileInput } from './dto/create-profile.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { Profile, User } from 'src/graphql';
import { UserService } from 'src/user/user.service';

@Resolver('Profile')
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
    private readonly userService: UserService,
  ) {}

  @Mutation('createProfile')
  create(@Args('createProfileInput') createProfileInput: CreateProfileInput) {
    return this.profileService.create(createProfileInput);
  }

  @Query('profiles')
  getAllProfiles() {
    return this.profileService.findAll();
  }

  @Query('profile')
  getProfile(@Args('id') id: string) {
    return this.profileService.findOne(Number(id));
  }

  @ResolveField('user')
  async getUser(@Parent() profile: Profile) {
    return this.userService.getUserByProfileId(Number(profile.id));
  }
}
