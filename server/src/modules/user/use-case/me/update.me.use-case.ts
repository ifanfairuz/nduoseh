import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { IUpdateMeBody, VerifiedToken } from '@panah/contract';
import { GetUserInfoUseCase } from '../user/get-user-info.user-case';
import { AccountRepository } from '../../repositories/account.repository';
import { PrismaAtomicService } from 'src/services/prisma/atomic.service';
import { HashService } from 'src/services/cipher/hash.service';

@Injectable()
export class UpdateMeUseCase {
  constructor(
    @Inject() private readonly atomic: PrismaAtomicService,
    @Inject() private readonly user: UserRepository,
    @Inject() private readonly account: AccountRepository,
    @Inject() private readonly userInfo: GetUserInfoUseCase,
    @Inject() private readonly hash: HashService,
  ) {}

  async execute(access_token: VerifiedToken, payload: IUpdateMeBody) {
    return await this.atomic.tx(async (tx) => {
      const user = await this.user.updateMe(
        access_token.user_id,
        {
          email: payload.email,
          callname: payload.callname,
          name: payload.name,
        },
        { tx },
      );

      if (user) {
        // update account password
        if (payload.password) {
          await this.account.updatePasswordAccount(
            {
              user_id: access_token.user_id,
              password: await this.hash.hash(payload.password),
            },
            { tx },
          );
        }
        return await this.userInfo.withUserInfo(user);
      }

      return null;
    });
  }
}
