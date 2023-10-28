import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';
// import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';

@InputType('CreateUserInput')
export class PostCreateInputDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  image: any;
  file: any;
}
