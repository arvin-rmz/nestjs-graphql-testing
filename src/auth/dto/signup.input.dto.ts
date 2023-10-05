import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

@InputType('SignupInput')
export class SignupInputDTO {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field()
  @Length(6)
  password: string;
}
