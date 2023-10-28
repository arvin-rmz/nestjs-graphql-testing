import { Scalar, CustomScalar } from '@nestjs/graphql';
   import { Kind, ValueNode } from 'graphql';
   
   @Scalar('Upload')
   export class Upload implements CustomScalar<any, any> {
     description = 'Upload custom scalar type';

     parseValue(value: any) {
       return value;
     }

     serialize(value: any) {
       return value;
     }

     parseLiteral(ast: ValueNode): any {
       if (ast.kind === Kind.STRING) {
         return ast.value;
       }
       return null;
     }
   }