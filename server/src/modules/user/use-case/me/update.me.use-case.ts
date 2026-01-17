import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { IUpdateMeBody, VerifiedToken } from '@panah/contract';

@Injectable()
export class UpdateMeUseCase {
  constructor(@Inject() private readonly user: UserRepository) {}

  async execute(access_token: VerifiedToken, payload: IUpdateMeBody) {
    return await this.user.update(access_token.user_id, {
      email: payload.email,
      callname: payload.callname,
      name: payload.name,
    });
  }
}
