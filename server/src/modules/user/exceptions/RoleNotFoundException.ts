export class RoleNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Role '${identifier}' not found`);
    this.name = 'RoleNotFoundException';
  }
}
