import { Inject, Injectable } from '@nestjs/common';
import { RoleRepository } from '../../repositories/role.repository';
import { ValidatePermissionsUseCase } from './validate-permissions.use-case';
import { InvalidPermissionException } from '../../exceptions/InvalidPermissionException';

interface CreateRoleInput {
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
}

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject() private readonly roleRepository: RoleRepository,
    @Inject() private readonly validatePermissions: ValidatePermissionsUseCase,
  ) {}

  async execute(input: CreateRoleInput) {
    // Validate permissions against APP_PERMISSIONS
    const invalidPermissions = this.validatePermissions.execute(
      input.permissions,
    );
    if (invalidPermissions.length > 0) {
      throw new InvalidPermissionException(invalidPermissions);
    }

    return await this.roleRepository.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
      permissions: input.permissions,
      is_system: false,
      active: true,
    });
  }
}
