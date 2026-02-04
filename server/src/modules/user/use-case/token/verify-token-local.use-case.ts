import { Inject, Injectable } from '@nestjs/common';
import { VerifyTokenUseCase } from './verify-token.use-case';
import { AccessTokenService } from '../../services/access-token.service';
import { AccessTokenRepository } from '../../repositories/access-token.repository';
import { UserRepository } from '../../repositories/user.repository';
import { ClientInfo } from '@nduoseh/contract';
import { VerifiedToken } from '@nduoseh/contract';
import { ErrorTokenException } from '../../exceptions/ErrorTokenException';

@Injectable()
export class VerifyTokenLocalUseCase extends VerifyTokenUseCase {
  constructor(
    @Inject() private readonly accessTokenService: AccessTokenService,
    @Inject() private readonly accessToken: AccessTokenRepository,
    @Inject() userRepo: UserRepository,
  ) {
    super(userRepo);
  }

  public async execute(
    token: string,
    audience: ClientInfo = {},
  ): Promise<VerifiedToken> {
    const aud: string[] = [];
    if (audience.device_id) {
      aud.push(audience.device_id);
    }
    if (audience.user_agent) {
      aud.push(audience.user_agent);
    }
    if (audience.ip_address) {
      aud.push(audience.ip_address);
    }

    const payload = await this.accessTokenService.verify(token, aud);
    const result = await this.accessToken.findBySessionId(payload.sid);
    if (!result) {
      throw new ErrorTokenException('cannot find access token');
    }

    if (result.session_id !== payload.sid) {
      throw new ErrorTokenException('access token invalid');
    }

    await this.accessTokenService.verifyHash(result.token_hash, token);

    return {
      user_id: result.user_id,
      session_id: result.session_id,
    };
  }
}
