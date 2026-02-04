export class SuperadminProtectedException extends Error {
  constructor() {
    super('Only superadmin users can create or modify superadmin users');
    this.name = 'SuperadminProtectedException';
  }
}
