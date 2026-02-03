import { Inject, Injectable } from '@nestjs/common';

export interface PermissionGroup {
  resource: string;
  permissions: string[];
}

@Injectable()
export class GetAvailablePermissionsUseCase {
  constructor(
    @Inject('APP_PERMISSIONS') private readonly appPermissions: string[],
  ) {}

  execute(): { permissions: string[]; groups: PermissionGroup[] } {
    // Group permissions by resource (e.g., "users", "roles")
    const groupMap = new Map<string, string[]>();

    for (const permission of this.appPermissions) {
      const parts = permission.split('.');
      const resource = parts[0] || 'other';

      if (!groupMap.has(resource)) {
        groupMap.set(resource, []);
      }
      groupMap.get(resource)!.push(permission);
    }

    // Convert map to array and sort
    const groups: PermissionGroup[] = Array.from(groupMap.entries())
      .map(([resource, permissions]) => ({
        resource,
        permissions: permissions.sort(),
      }))
      .sort((a, b) => a.resource.localeCompare(b.resource));

    return {
      permissions: this.appPermissions,
      groups,
    };
  }
}
