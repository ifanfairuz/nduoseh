import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../../repositories/role.repository';
import { UserRoleRepository } from '../../repositories/user-role.repository';
import { ValidatePermissionsUseCase } from './validate-permissions.use-case';
import { SystemRoleProtectedException } from '../../exceptions/SystemRoleProtectedException';
import { InvalidPermissionException } from '../../exceptions/InvalidPermissionException';
import { PermissionCacheService } from '../../services/permission-cache.service';

interface UpdateRoleInput {
  roleId: string;
  name?: string;
  description?: string;
  permissions?: string[];
  active?: boolean;
}

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject() private readonly roleRepository: RoleRepository,
    @Inject() private readonly userRoleRepository: UserRoleRepository,
    @Inject() private readonly validatePermissions: ValidatePermissionsUseCase,
    @Inject() private readonly permissionCache: PermissionCacheService,
  ) {}

  async execute(input: UpdateRoleInput) {
    // Check if role exists and is not system role
    const role = await this.roleRepository.findById(input.roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.is_system) {
      throw new SystemRoleProtectedException(role.slug);
    }

    // Validate permissions if provided
    if (input.permissions) {
      const invalidPermissions = this.validatePermissions.execute(
        input.permissions,
      );
      if (invalidPermissions.length > 0) {
        throw new InvalidPermissionException(invalidPermissions);
      }
    }

    // Update role
    const updatedRole = await this.roleRepository.update(input.roleId, {
      name: input.name,
      description: input.description,
      permissions: input.permissions,
      active: input.active,
    });

    // Invalidate cache for all users with this role
    if (input.permissions || input.active !== undefined) {
      const usersWithRole = await this.userRoleRepository.getUsersWithRole(
        input.roleId,
      );

      const userIds = usersWithRole.map((ur) => ur.user_id);
      await this.permissionCache.invalidateMultipleUsers(userIds);
    }

    return updatedRole;
  }
}
