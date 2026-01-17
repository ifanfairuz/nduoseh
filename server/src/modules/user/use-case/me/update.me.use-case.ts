import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { IUpdateMeBody, VerifiedToken } from '@panah/contract';
import { GetUserInfoUseCase } from '../user/get-user-info.user-case';

@Injectable()
export class UpdateMeUseCase {
  constructor(
    @Inject() private readonly user: UserRepository,
    @Inject() private readonly userInfo: GetUserInfoUseCase,
  ) {}

  async execute(access_token: VerifiedToken, payload: IUpdateMeBody) {
    const user = await this.user.update(access_token.user_id, {
      email: payload.email,
      callname: payload.callname,
      name: payload.name,
    });

    if (user) {
      return await this.userInfo.withUserInfo(user);
    }

    return null;
  }
}
