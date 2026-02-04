export class InvalidPermissionException extends Error {
  constructor(invalidPermissions: string[]) {
    super(
      `Invalid permissions: ${invalidPermissions.join(', ')}. Permissions must exist in APP_PERMISSIONS registry.`,
    );
    this.name = 'InvalidPermissionException';
  }
}
