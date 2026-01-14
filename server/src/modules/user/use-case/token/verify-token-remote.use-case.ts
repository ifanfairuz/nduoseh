import { Inject, Injectable } from '@nestjs/common';
import { VerifyTokenUseCase } from './verify-token.use-case';
import { UserRepository } from '../../repositories/user.repository';
import type { UserConfig } from '../../config';
import { ClientInfo } from '@panah/contract';
import { VerifiedToken } from '@panah/contract';
import { ErrorTokenException } from '../../exceptions/ErrorTokenException';

@Injectable()
export class VerifyTokenRemoteUseCase extends VerifyTokenUseCase {
  private remote_url: string;

  constructor(
    @Inject('USER_CONFIG') config: UserConfig,
    @Inject() userRepo: UserRepository,
  ) {
    super(userRepo);

    if (!config.auth.remote_auth) {
      throw Error('remote_auth configuration not set.');
    }

    this.remote_url = config.auth.remote_auth;
  }

  public async execute(
    token: string,
    audience?: ClientInfo,
  ): Promise<VerifiedToken> {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);
    if (audience?.user_agent) headers.append('User-Agent', audience.user_agent);
    if (audience?.device_id) headers.append('X-Device-Id', audience.device_id);

    try {
      const result = await fetch(this.remote_url, {
        headers,
      }).then<VerifiedToken>((res) => res.json());

      if (!result.user_id || !result.session_id) {
        throw new Error('invalid response from remote auth');
      }

      return {
        user_id: result.user_id,
        session_id: result.session_id,
      };
    } catch (error) {
      if (error instanceof ErrorTokenException) {
        throw error;
      }

      throw new ErrorTokenException('invalid-token', { cause: error });
    }
  }
}
