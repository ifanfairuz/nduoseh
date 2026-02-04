import { Inject, Injectable } from '@nestjs/common';
import { AuthSessionRepository } from '../repositories/auth-session.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { AccessTokenRepository } from '../repositories/access-token.repository';
import { VerifiedToken } from '@nduoseh/contract';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject() private readonly sessionRepository: AuthSessionRepository,
    @Inject() private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject() private readonly accessTokenRepository: AccessTokenRepository,
  ) {}

  async execute(access: VerifiedToken) {
    await Promise.all([
      // revoke all access token with session_id
      this.accessTokenRepository.deleteBySessionId(access.session_id),
      // destroy session
      this.sessionRepository.delete(access.session_id),
      // invalidate
      this.refreshTokenRepository.invalidateForSessionId(access.session_id),
    ]);
  }
}
