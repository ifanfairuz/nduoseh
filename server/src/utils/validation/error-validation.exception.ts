export class ErrorValidationException<
  M = Record<string, unknown[]>,
  K extends keyof M = keyof M,
  A = M[K],
> extends Error {
  public name = 'ErrorValidationException';

  public constructor(
    message: string,
    public readonly code: K,
    public type: string = '',
    public readonly args: A = [] as A,
  ) {
    super(message);
  }
}
