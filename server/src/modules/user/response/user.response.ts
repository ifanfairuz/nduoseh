import type { User } from '@panah/contract';
import { UserImageDisk } from '../storage/user-image.disk';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
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
  data: {
    id: User['id'];
    email: User['email'];
    name: User['name'];
    callname: User['callname'];
    image: User['image'];
  };

  @ApiProperty({
    description: 'Modules',
    example: ['user', 'product'],
  })
  modules: string[];

  @ApiProperty({
    description: 'Permission',
    example: ['user.read', 'user.write'],
  })
  permission: string[];

  constructor(payload: User, permission: string[] = []) {
    this.permission = permission;
    this.data = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      callname: payload.callname,
      image: payload.image,
    };
  }

  static async withImageUrl(payload: User, storage: UserImageDisk) {
    const image = payload.image ? await storage.get(payload.image) : null;
    return new UserResponse({
      ...payload,
      image: (await image?.getUrl()) ?? null,
    });
  }
}
