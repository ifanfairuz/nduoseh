import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { UserImageDisk } from '../../storage/user-image.disk';
import { VerifiedToken } from '@panah/contract';
import { GetUserInfoUseCase } from '../user/get-user-info.user-case';

@Injectable()
export class UpdateImageMeUseCase {
  constructor(
    @Inject() private readonly user: UserRepository,
    @Inject() private readonly disk: UserImageDisk,
    @Inject() private readonly userInfo: GetUserInfoUseCase,
  ) {}

  async execute(access_token: VerifiedToken, image: Buffer, mime?: string) {
    const file = await this.disk.save(image, { mime });

    try {
      const user = await this.user.updateMe(access_token.user_id, {
        image: file.identifier,
      });
      return await this.userInfo.withUserInfo(user);
    } catch (error) {
      await this.disk.delete(file.identifier);
      throw error;
    }
  }
}
