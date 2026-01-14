import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { UserImageDisk } from '../../storage/user-image.disk';
import { VerifiedToken } from '@panah/contract';

@Injectable()
export class UpdateImageUserUseCase {
  constructor(
    @Inject() private readonly user: UserRepository,
    @Inject() private readonly disk: UserImageDisk,
  ) {}

  async execute(access_token: VerifiedToken, image: Buffer) {
    const file = await this.disk.save(image);

    try {
      return await this.user.update(access_token.user_id, {
        image: file.identifier,
      });
    } catch (error) {
      await this.disk.delete(file.identifier);
      throw error;
    }
  }
}
