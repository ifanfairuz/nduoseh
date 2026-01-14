export class ErrorTokenException extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ErrorTokenException';
  }
}
