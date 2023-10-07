import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNumber, IsString } from 'class-validator';

@InputType('FindUserInput')
export class FindUserInputDTO {
  @Field()
  @IsString()
  id: string;
}
