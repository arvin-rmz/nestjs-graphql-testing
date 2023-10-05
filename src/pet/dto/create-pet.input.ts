import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType('CreatePetInput')
export class CreatePetInputDTO {
  @Field()
  @IsString()
  name: string;

  // @Field()
  // completed!: boolean;
}
