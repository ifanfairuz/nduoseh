import { Inject, Injectable } from '@nestjs/common';
import { RoleRepository } from '../../repositories/role.repository';

@Injectable()
export class ListRolesUseCase {
  constructor(@Inject() private readonly roleRepository: RoleRepository) {}

  async execute() {
    return await this.roleRepository.findMany();
  }
}
