export class ErrorValidationException extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string,
  ) {
    super(message);
  }
}
