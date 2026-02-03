import { SetMetadata } from '@nestjs/common';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

export const SomePermissions = (...permissions: string[]) =>
  SetMetadata('some-permissions', permissions);
