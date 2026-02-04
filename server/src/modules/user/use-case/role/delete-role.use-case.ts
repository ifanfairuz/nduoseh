import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../../repositories/role.repository';
import { UserRoleRepository } from '../../repositories/user-role.repository';
import { SystemRoleProtectedException } from '../../exceptions/SystemRoleProtectedException';
import { PermissionCacheService } from '../../services/permission-cache.service';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject() private readonly roleRepository: RoleRepository,
    @Inject() private readonly userRoleRepository: UserRoleRepository,
    @Inject() private readonly permissionCache: PermissionCacheService,
  ) {}

  async execute(roleId: string) {
    // Check if role exists and is not system role
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.is_system) {
      throw new SystemRoleProtectedException(role.slug);
    }

    // Get users with this role to invalidate cache
    const usersWithRole =
      await this.userRoleRepository.getUsersWithRole(roleId);
    const userIds = usersWithRole.map((ur) => ur.user_id);

    // Soft delete role
    await this.roleRepository.delete(roleId);

    // Invalidate cache for affected users
    await this.permissionCache.invalidateMultipleUsers(userIds);

    return { success: true };
  }
}
