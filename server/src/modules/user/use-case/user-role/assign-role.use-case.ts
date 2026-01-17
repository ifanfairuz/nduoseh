import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRoleRepository } from '../../repositories/user-role.repository';
import { UserRepository } from '../../repositories/user.repository';
import { RoleRepository } from '../../repositories/role.repository';
import { PermissionCacheService } from '../../services/permission-cache.service';

interface AssignRoleInput {
  userId: string;
  roleId: string;
}

@Injectable()
export class AssignRoleUseCase {
  constructor(
    @Inject() private readonly userRoleRepository: UserRoleRepository,
    @Inject() private readonly userRepository: UserRepository,
    @Inject() private readonly roleRepository: RoleRepository,
    @Inject() private readonly cache: PermissionCacheService,
  ) {}

  async execute(input: AssignRoleInput) {
    // Verify user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify role exists
    const role = await this.roleRepository.findById(input.roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Assign role
    const userRole = await this.userRoleRepository.assign(
      input.userId,
      input.roleId,
    );

    // Invalidate user's permission cache
    await this.cache.invalidateUser(input.userId);

    return userRole;
  }
}
