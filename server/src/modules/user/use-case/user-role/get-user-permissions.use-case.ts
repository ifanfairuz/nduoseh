import { Inject, Injectable } from '@nestjs/common';
import { UserRoleRepository } from '../../repositories/user-role.repository';
import { PermissionCacheService } from '../../services/permission-cache.service';

@Injectable()
export class GetUserPermissionsUseCase {
  constructor(
    @Inject() private readonly userRole: UserRoleRepository,
    @Inject() private readonly cache: PermissionCacheService,
  ) {}

  async execute(userId: string): Promise<string[]> {
    // Try cache first
    const cached = await this.cache.getPermissions(userId);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const permissions = await this.userRole.getUserPermissionsArray(userId);

    // Cache for future requests
    await this.cache.setPermissions(userId, permissions);

    return permissions;
  }

  async executeAsSet(userId: string): Promise<Set<string>> {
    // Try cache first
    const cached = await this.cache.getPermissions(userId);
    if (cached) {
      return new Set(cached);
    }

    // Fetch from database
    const permissions = await this.userRole.getUserPermissions(userId);

    // Cache for future requests
    await this.cache.setPermissions(userId, Array.from(permissions));

    return permissions;
  }
}
