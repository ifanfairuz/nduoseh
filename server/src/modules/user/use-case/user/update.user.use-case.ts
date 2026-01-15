import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { IUpdateUserBody, VerifiedToken } from '@panah/contract';

@Injectable()
export class UpdateUserUseCase {
  constructor(@Inject() private readonly user: UserRepository) {}

  async execute(access_token: VerifiedToken, payload: IUpdateUserBody) {
    return await this.user.update(access_token.user_id, {
      callname: payload.callname,
      name: payload.name,
    });
  }
}
