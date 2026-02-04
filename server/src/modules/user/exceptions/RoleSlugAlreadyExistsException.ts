export class RoleSlugAlreadyExistsException extends Error {
  constructor(slug: string) {
    super(`Role with slug '${slug}' already exists`);
    this.name = 'RoleSlugAlreadyExistsException';
  }
}
