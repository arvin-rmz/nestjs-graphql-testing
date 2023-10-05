import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, Length } from 'class-validator';

@InputType('LoginInput')
export class LoginInputDTO {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(6)
  password: string;
}
