import { Inject, Injectable } from '@nestjs/common';
import { UserRoleRepository } from '../../repositories/user-role.repository';

@Injectable()
export class GetUserRolesUseCase {
  constructor(@Inject() private readonly repo: UserRoleRepository) {}

  async execute(userId: string) {
    return await this.repo.findUserRoles(userId);
  }
}
