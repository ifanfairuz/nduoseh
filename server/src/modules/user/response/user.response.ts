import type { User, IMeResponse, LoginResponse } from '@panah/contract';
import { UserImageDisk } from '../storage/user-image.disk';
import { ApiProperty } from '@nestjs/swagger';

export class MeResponse implements IMeResponse {
  @ApiProperty({
    description: 'User data',
    example: {
      id: 'tz4a98xxat96iws9zmbrgj3a',
      name: 'John Doe',
      callname: 'john',
      email: 'john.doe@example.com',
      email_verified: true,
      image: 'https://kai.pics/avatar.png',
    },
  })
  data: IMeResponse['data'];

  @ApiProperty({
    description: 'Modules',
    example: ['user', 'product'],
  })
  modules: string[];

  @ApiProperty({
    description: 'Permission',
    example: ['user.read', 'user.write'],
  })
  permissions: string[];

  constructor(
    payload: User,
    permissions: string[] = [],
    modules: string[] = [],
    roles: LoginResponse['roles'] = [],
  ) {
    this.modules = modules;
    this.permissions = permissions;
    this.data = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      callname: payload.callname,
      image: payload.image,
      roles: roles,
    };
  }

  static async withImageUrl(
    payload: User,
    storage: UserImageDisk,
    domain?: string,
    permissions: string[] = [],
    modules: string[] = [],
    roles: LoginResponse['roles'] = [],
  ) {
    const image = payload.image ? await storage.get(payload.image) : null;
    return new MeResponse(
      {
        ...payload,
        image: (await image?.getUrl(domain)) ?? null,
      },
      permissions,
      modules,
      roles,
    );
  }
}
