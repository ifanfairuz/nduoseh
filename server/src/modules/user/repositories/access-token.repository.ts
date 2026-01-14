import { Inject, Injectable } from '@nestjs/common';
import { AccessToken } from '@panah/contract';
import { differenceInSeconds } from 'date-fns';
import { RedisService } from 'src/services/redis/redis.service';

export type AccessTokenCreatePayload = Pick<
  AccessToken,
  'user_id' | 'session_id' | 'token_hash' | 'expires_at'
>;

@Injectable()
export class AccessTokenRepository {
  @Inject() private readonly redis: RedisService;

  async store(payload: AccessTokenCreatePayload): Promise<AccessToken> {
    const key = `auth:access_token:${payload.session_id}`;
    const expires_seccond = differenceInSeconds(payload.expires_at, new Date());
    await this.redis.set(
      key,
      JSON.stringify({
        ...payload,
        expires_at: payload.expires_at.getTime(),
      }),
      'EX',
      expires_seccond,
    );

    return {
      user_id: payload.user_id,
      session_id: payload.session_id,
      token_hash: payload.token_hash,
      expires_at: payload.expires_at,
    };
  }

  async findBySessionId(
    session_id: AccessToken['session_id'],
  ): Promise<AccessToken | null> {
    const key = `auth:access_token:${session_id}`;
    const data = await this.redis.get(key);
    if (!data) {
      return null;
    }

    const payload = JSON.parse(data) as AccessToken;
    return {
      user_id: payload.user_id,
      session_id: payload.session_id,
      token_hash: payload.token_hash,
      expires_at: new Date(payload.expires_at),
    };
  }

  async deleteBySessionId(
    session_id: AccessToken['session_id'],
  ): Promise<void> {
    const key = `auth:access_token:${session_id}`;
    await this.redis.del(key);
  }
}
