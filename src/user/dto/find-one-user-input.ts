import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType('FindUserInput')
export class FindUserInputDTO {
  @Field()
  @IsEmail()
  email: string;
}
