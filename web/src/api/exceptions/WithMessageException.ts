export class WithMessageException extends Error {
  public readonly name = "WithMessageException";

  constructor(message: string) {
    super(message);
  }
}
