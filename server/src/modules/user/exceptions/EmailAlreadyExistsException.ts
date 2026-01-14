export class EmailAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`Email ${email} already exists`);
    this.name = 'EmailAlreadyExistsException';
  }
}
