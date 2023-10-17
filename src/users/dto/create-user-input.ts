import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length, IsEmail } from 'class-validator';

@InputType('CreateUserInput')
export class CreateUserInputDTO {
  @Field()
  @IsString()
  firstName!: string;

  @Field()
  @IsString()
  lastName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(8)
  password: string;
}
