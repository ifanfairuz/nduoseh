export class ErrorRefreshException extends Error {
  public name = 'ErrorRefreshException';

  constructor(
    message: string,
    public readonly revoked = false,
  ) {
    super(message);
  }
}
