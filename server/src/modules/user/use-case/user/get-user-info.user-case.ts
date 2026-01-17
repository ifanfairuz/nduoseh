import { User } from '@panah/contract';
import { GetUserPermissionsUseCase } from '../user-role/get-user-permissions.use-case';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetUserInfoUseCase {
  constructor(
    @Inject()
    private readonly getUserPermissions: GetUserPermissionsUseCase,
    @Inject('FEATURE_MODULES')
    private readonly modules: Record<string, string[]>,
  ) {}

  async getInfo(user_id: User['id']) {
    const permissions = await this.getUserPermissions.executeAsSet(user_id);
    const modules: string[] = [];
    for (const name in this.modules) {
      for (const p of this.modules[name]) {
        if (permissions.has(p)) {
          modules.push(name);
          break;
        }
      }
    }
    return { permissions: Array.from(permissions), modules };
  }

  async withUserInfo(user: User) {
    const info = await this.getInfo(user.id);
    return { ...info, user };
  }
}
