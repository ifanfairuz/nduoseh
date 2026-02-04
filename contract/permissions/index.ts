export interface PermissionGroup {
  resource: string;
  permissions: string[];
}

export interface AvailablePermissionsResponse {
  permissions: string[];
  groups: PermissionGroup[];
}
