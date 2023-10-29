import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';
import { Exclude } from 'class-transformer';

import { Upload } from './post-create-files-input';

@InputType('postCreateInput')
export class PostCreateInputDTO {
  // @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  // @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Exclude()
  files: Upload[];
}
