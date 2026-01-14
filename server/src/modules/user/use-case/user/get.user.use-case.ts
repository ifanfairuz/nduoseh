import { Inject, Injectable } from '@nestjs/common';
import { VerifiedToken } from '@panah/contract';
import { UserRepository } from '../../repositories/user.repository';
import { VerifyTokenUseCase } from '../token/verify-token.use-case';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject() private readonly user: UserRepository,
    @Inject() private readonly verify: VerifyTokenUseCase,
  ) {}

  async execute(access_token: VerifiedToken | string) {
    let token: VerifiedToken;

    if (typeof access_token === 'string') {
      token = await this.verify.execute(access_token);
    } else {
      token = access_token;
    }

    return await this.user.findById(token.user_id);
  }
}
