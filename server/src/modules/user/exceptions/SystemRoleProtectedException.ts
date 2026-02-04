export class SystemRoleProtectedException extends Error {
  constructor(roleSlug: string) {
    super(`System role '${roleSlug}' cannot be modified or deleted`);
    this.name = 'SystemRoleProtectedException';
  }
}
