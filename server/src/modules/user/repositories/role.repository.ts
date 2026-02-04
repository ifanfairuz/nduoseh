import { Injectable } from '@nestjs/common';
import {
  PrismaMethodOptions,
  PrismaRepository,
} from 'src/services/prisma/prisma.repository';
import { Role } from '@nduoseh/contract';
import { createCuid2Generator } from 'src/utils/generator';
import { ConflictException } from '@nestjs/common';

export type RoleCreatePayload = Pick<Role, 'name' | 'slug' | 'permissions'> &
  Partial<Pick<Role, 'description' | 'is_system' | 'active'>>;

export type RoleUpdatePayload = Partial<
  Pick<Role, 'name' | 'description' | 'permissions' | 'active'>
>;

export const genRoleId = createCuid2Generator('role-id', 24);

@Injectable()
export class RoleRepository extends PrismaRepository {
  async create(payload: RoleCreatePayload, options?: PrismaMethodOptions) {
    const client = this._client(options);

    // Check if slug already exists
    const exists = await client.role.findUnique({
      where: { slug: payload.slug },
      select: { id: true },
    });

    if (exists) {
      throw new ConflictException(
        `Role with slug '${payload.slug}' already exists`,
      );
    }

    return await client.role.create({
      data: {
        id: genRoleId(),
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        permissions: payload.permissions,
        is_system: payload.is_system ?? false,
        active: payload.active ?? true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        permissions: true,
        is_system: true,
        active: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async update(
    id: Role['id'],
    payload: RoleUpdatePayload,
    options?: PrismaMethodOptions,
  ) {
    return await this._client(options).role.update({
      where: { id, deleted_at: null },
      data: {
        name: payload.name,
        description: payload.description,
        permissions: payload.permissions,
        active: payload.active,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        permissions: true,
        is_system: true,
        active: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async delete(id: Role['id'], options?: PrismaMethodOptions) {
    await this._client(options).role.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findById(id: Role['id'], options?: PrismaMethodOptions) {
    return await this._client(options).role.findUnique({
      where: { id, deleted_at: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        permissions: true,
        is_system: true,
        active: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findBySlug(slug: Role['slug'], options?: PrismaMethodOptions) {
    return await this._client(options).role.findUnique({
      where: { slug, deleted_at: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        permissions: true,
        is_system: true,
        active: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findMany(options?: PrismaMethodOptions) {
    return await this._client(options).role.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        permissions: true,
        is_system: true,
        active: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
