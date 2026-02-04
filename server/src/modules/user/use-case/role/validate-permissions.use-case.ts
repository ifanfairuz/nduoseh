import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ValidatePermissionsUseCase {
  constructor(
    @Inject('APP_PERMISSIONS') private readonly appPermissions: string[],
  ) {}

  execute(permissions: string[]): string[] {
    const permissionSet = new Set(this.appPermissions);
    const invalidPermissions: string[] = [];

    for (const perm of permissions) {
      if (!permissionSet.has(perm)) {
        invalidPermissions.push(perm);
      }
    }

    return invalidPermissions;
  }
}
