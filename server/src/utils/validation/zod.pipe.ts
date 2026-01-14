import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { output, ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe<T extends ZodType> implements PipeTransform<
  unknown,
  output<T>
> {
  constructor(
    private readonly schema: T,
    private readonly type: 'query' | 'body' = 'body',
  ) {}

  transform(value: unknown, meta: ArgumentMetadata): output<T> {
    if (meta.type === 'body') {
      return this.schema.parse(value);
    } else if (meta.type == 'query' && this.type == 'query') {
      return this.schema.parse(value);
    }

    return value as output<T>;
  }
}
