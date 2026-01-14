import { getUnixTime } from 'date-fns';
import { Inject, Injectable } from '@nestjs/common';
import { ClientInfo } from '@panah/contract';
import { RefreshTokenService } from '../../services/refresh-token.service';
import { AuthSessionRepository } from '../../repositories/auth-session.repository';
import { RefreshTokenRepository } from '../../repositories/refresh-token.repository';
import { AccessTokenRepository } from '../../repositories/access-token.repository';
import { ErrorRefreshException } from '../../exceptions/ErrorRefreshException';
import { AccessTokenService } from '../../services/access-token.service';

export interface RefreshTokenResult {
  access_token: {
    token: string;
    expires_at: number;
  };
  refresh_token: {
    token: string;
    expires_at: number;
  };
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject() private readonly refreshTokenService: RefreshTokenService,
    @Inject() private readonly accessTokenService: AccessTokenService,
    @Inject() private readonly sessionRepository: AuthSessionRepository,
    @Inject() private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject() private readonly accessTokenRepository: AccessTokenRepository,
  ) {}

  /**
   * Destroy refresh token
   *
   * @param {string} id
   * @returns {Promise<void>}
   */
  private async destroy(id: string, session_id: string) {
    await Promise.all([
      // delete refresh token
      this.refreshTokenRepository.delete(id),
      // destroy session
      this.sessionRepository.delete(session_id),
      // revoke all access token with session_id
      this.accessTokenRepository.deleteBySessionId(session_id),
    ]);
  }

  /**
   * Refresh token
   *
   * @param {string} refresh_token
   * @returns {Promise<VerifiedToken>}
   */
  public async execute(
    refresh_token: string,
    client: ClientInfo,
  ): Promise<RefreshTokenResult> {
    const { id, session_id } = this.refreshTokenService.verify(refresh_token);

    // get refresh token from database and mark as used
    const data = await this.refreshTokenRepository.findById(id);
    if (!data) {
      throw new ErrorRefreshException('Invalid token');
    }

    // validate hash
    try {
      await this.refreshTokenService.verifyHash(data.token_hash, refresh_token);
    } catch {
      await this.destroy(id, session_id);
      throw new ErrorRefreshException('Token invalid', true);
    }

    // validate session_id is same
    if (data.session_id !== session_id) {
      await this.refreshTokenRepository.delete(id);
      throw new ErrorRefreshException('Token invalid', true);
    }

    // validate refresh token never used
    if (data.is_used) {
      await this.destroy(id, session_id);
      throw new ErrorRefreshException('Token already used', true);
    }

    // mark refresh token as used
    await this.refreshTokenRepository.setUsed(id);

    // validate refresh token expiration
    if (data.expires_at < new Date()) {
      throw new ErrorRefreshException('Expired token', true);
    }

    // validate device binding
    const session = await this.sessionRepository.findById(session_id);
    if (!session) {
      await this.destroy(id, session_id);
      throw new ErrorRefreshException('Invalid session', true);
    }

    if (client.device_id && client.device_id !== session.device_id) {
      await this.destroy(id, session_id);
      throw new ErrorRefreshException('Invalid device id', true);
    }

    if (client.user_agent && client.user_agent !== session.user_agent) {
      await this.destroy(id, session_id);
      throw new ErrorRefreshException('Invalid user agent', true);
    }

    if (client.ip_address && client.ip_address !== session.ip_address) {
      await this.destroy(id, session_id);
      throw new ErrorRefreshException('Invalid ip address', true);
    }

    // generate new refresh token
    const new_refresh_token =
      await this.refreshTokenService.generate(session_id);

    // generate new access token
    const new_access_token = await this.accessTokenService.generate(
      session.user_id,
      session_id,
      client,
    );

    try {
      await this.refreshTokenRepository.store({
        id: new_refresh_token.id,
        session_id,
        token_hash: new_refresh_token.hash,
        expires_at: new_refresh_token.expires_at,
      });

      await this.accessTokenRepository.store({
        user_id: session.user_id,
        session_id,
        token_hash: new_access_token.hash,
        expires_at: new_access_token.expires_at,
      });

      return {
        access_token: {
          token: new_access_token.token,
          expires_at: getUnixTime(new_access_token.expires_at),
        },
        refresh_token: {
          token: new_refresh_token.token,
          expires_at: getUnixTime(new_refresh_token.expires_at),
        },
      };
    } catch (error) {
      await this.refreshTokenRepository.delete(new_refresh_token.id);
      await this.accessTokenRepository.deleteBySessionId(session_id);
      throw error;
    }
  }
}
