import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, Length } from 'class-validator';

@InputType('LoginInput')
export class LoginInputDTO {
  @IsEmail()
  email: string;

  @Length(6)
  password: string;
}
