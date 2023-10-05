import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length, IsEmail } from 'class-validator';

@InputType('CreateUserInput')
export class PostCreateInputDTO {
  @Field()
  @IsString()
  title!: string;

  @Field()
  @IsString()
  content: string;
}
