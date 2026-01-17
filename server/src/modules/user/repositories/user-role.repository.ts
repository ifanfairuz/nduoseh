import { Injectable } from '@nestjs/common';
import {
  PrismaMethodOptions,
  PrismaRepository,
} from 'src/services/prisma/prisma.repository';
import { createCuid2Generator } from 'src/utils/generator';

export const genUserRoleId = createCuid2Generator('user-role-id', 24);

@Injectable()
export class UserRoleRepository extends PrismaRepository {
  async assign(userId: string, roleId: string, options?: PrismaMethodOptions) {
    const client = this._client(options);

    // Check if already assigned
    const exists = await client.userRole.findUnique({
      where: {
        unique_user_role: {
          user_id: userId,
          role_id: roleId,
        },
      },
    });

    if (exists) {
      return exists;
    }

    return await client.userRole.create({
      data: {
        id: genUserRoleId(),
        user_id: userId,
        role_id: roleId,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
            permissions: true,
          },
        },
      },
    });
  }

  async remove(userId: string, roleId: string, options?: PrismaMethodOptions) {
    await this._client(options).userRole.delete({
      where: {
        unique_user_role: {
          user_id: userId,
          role_id: roleId,
        },
      },
    });
  }

  async findUserRoles(userId: string, options?: PrismaMethodOptions) {
    return await this._client(options).userRole.findMany({
      where: { user_id: userId, role: { deleted_at: null, active: true } },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            permissions: true,
            is_system: true,
          },
        },
      },
    });
  }

  async getUserPermissions(
    userId: string,
    options?: PrismaMethodOptions,
  ): Promise<Set<string>> {
    const userRoles = await this.findUserRoles(userId, options);

    // Flatten and deduplicate permissions from all roles
    const permissions = new Set<string>();
    userRoles.forEach((ur) => {
      const perms = ur.role.permissions as string[] | undefined;
      const rolePermissions = Array.isArray(perms) ? perms : [];
      rolePermissions.forEach((perm) => permissions.add(perm));
    });

    return permissions;
  }

  async getUserPermissionsArray(
    userId: string,
    options?: PrismaMethodOptions,
  ): Promise<string[]> {
    const permissions = await this.getUserPermissions(userId, options);
    return Array.from(permissions);
  }

  async hasRole(
    userId: string,
    roleSlug: string,
    options?: PrismaMethodOptions,
  ): Promise<boolean> {
    const userRole = await this._client(options).userRole.findFirst({
      where: {
        user_id: userId,
        role: {
          slug: roleSlug,
          deleted_at: null,
          active: true,
        },
      },
    });

    return !!userRole;
  }

  async hasPermission(
    userId: string,
    permission: string,
    options?: PrismaMethodOptions,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissionsArray(userId, options);
    return permissions.includes(permission);
  }

  async getUsersWithRole(roleId: string, options?: PrismaMethodOptions) {
    return await this._client(options).userRole.findMany({
      where: { role_id: roleId },
      select: {
        user_id: true,
      },
    });
  }
}
