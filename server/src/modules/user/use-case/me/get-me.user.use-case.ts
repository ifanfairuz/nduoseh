import { Inject, Injectable } from '@nestjs/common';
import { VerifiedToken } from '@panah/contract';
import { UserRepository } from '../../repositories/user.repository';
import { VerifyTokenUseCase } from '../token/verify-token.use-case';
import { GetUserInfoUseCase } from '../user/get-user-info.user-case';

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject() private readonly user: UserRepository,
    @Inject() private readonly verify: VerifyTokenUseCase,
    @Inject() private readonly userInfo: GetUserInfoUseCase,
  ) {}

  async execute(access_token: VerifiedToken | string) {
    let token: VerifiedToken;

    if (typeof access_token === 'string') {
      token = await this.verify.execute(access_token);
    } else {
      token = access_token;
    }

    const user = await this.user.findById(token.user_id);
    if (user) {
      return await this.userInfo.withUserInfo(user);
    }

    return null;
  }
}
