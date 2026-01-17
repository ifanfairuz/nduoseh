export class InsufficientPermissionsException extends Error {
  constructor(requiredPermissions: string[]) {
    super(
      `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
    );
    this.name = 'InsufficientPermissionsException';
  }
}
