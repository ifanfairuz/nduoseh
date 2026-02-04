import { trace, SpanStatusCode } from '@opentelemetry/api';

export function Traced(spanName?: string) {
  return function (
    target: Record<string, any>,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value as (
      ...args: any[]
    ) => Promise<unknown>;
    const tracer = trace.getTracer('nestjs-app', '1.0.0');

    descriptor.value = async function (
      this: any,
      ...args: any[]
    ): Promise<unknown> {
      const finalSpanName =
        spanName || `${target.constructor.name}.${propertyKey}`;

      return await tracer.startActiveSpan(finalSpanName, async (span) => {
        try {
          span.setAttributes({
            'method.class': target.constructor.name,
            'method.name': propertyKey,
          });

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const result = await originalMethod.apply(this, args);
          span.setStatus({ code: SpanStatusCode.OK });
          return result as unknown;
        } catch (error) {
          if (error instanceof Error) {
            span.recordException(error);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });
          } else {
            span.recordException(String(error));
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: String(error),
            });
          }

          throw error;
        } finally {
          span.end();
        }
      });
    };

    return descriptor;
  };
}
