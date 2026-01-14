import { User } from '@panah/contract';
import { UserImageDisk } from '../storage/user-image.disk';

export class UserResponse {
  static example = {
    id: 'tz4a98xxat96iws9zmbrgj3a',
    name: 'John Doe',
    callname: 'john',
    email: 'john.doe@example.com',
    email_verified: true,
    image: 'https://kai.pics/avatar.png',
  };

  id: User['id'];
  email: User['email'];
  name: User['name'];
  callname: User['callname'];
  image: User['image'] = null;

  constructor(payload: User) {
    this.id = payload.id;
    this.email = payload.email;
    this.name = payload.name;
    this.callname = payload.callname;
    this.image = payload.image;
  }

  static async withImageUrl(payload: User, storage: UserImageDisk) {
    const image = payload.image ? await storage.get(payload.image) : null;
    return new UserResponse({
      ...payload,
      image: (await image?.getUrl()) ?? null,
    });
  }
}
