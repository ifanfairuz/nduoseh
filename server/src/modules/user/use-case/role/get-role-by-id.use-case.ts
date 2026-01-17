import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../../repositories/role.repository';

@Injectable()
export class GetRoleByIdUseCase {
  constructor(@Inject() private readonly roleRepository: RoleRepository) {}

  async execute(roleId: string) {
    const role = await this.roleRepository.findById(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }
}
