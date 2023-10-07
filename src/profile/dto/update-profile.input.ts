import { CreateProfileInput } from './create-profile.input';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateProfileInput extends PartialType(CreateProfileInput) {
  id: number;
}
