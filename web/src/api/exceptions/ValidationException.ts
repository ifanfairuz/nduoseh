export class ValidationException extends Error {
  public readonly name = "ValidationException";
  public readonly issues: Record<string, string>;

  constructor(issues: Record<string, string>, message?: string) {
    super(message ?? "Error Bad Request");
    this.issues = issues;
  }
}
