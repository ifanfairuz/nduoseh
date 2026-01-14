import { applyDecorators, UsePipes } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import z, { ZodType } from 'zod';
import { ZodValidationPipe } from './zod.pipe';

export * from './error-validation.exception';
export * from './password.validation';

export const Validation = (
  schema: ZodType,
  type: 'body' | 'query' = 'body',
) => {
  const jsonSchema = z.toJSONSchema(schema) as SchemaObject;
  const validationType =
    type == 'body'
      ? ApiBody({ schema: jsonSchema })
      : ApiQuery({ schema: jsonSchema });

  return applyDecorators(
    UsePipes(new ZodValidationPipe(schema, type)),
    validationType,
  );
};
