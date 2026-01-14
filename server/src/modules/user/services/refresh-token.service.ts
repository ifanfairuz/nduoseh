import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { CipherService } from 'src/services/cipher/cipher.service';
import type { AuthConfig, UserConfig } from '../config';
import { HashService } from 'src/services/cipher/hash.service';
import { ErrorTokenException } from '../exceptions/ErrorTokenException';

@Injectable()
export class RefreshTokenService {
  private readonly config: AuthConfig;

  constructor(
    @Inject('USER_CONFIG') config: UserConfig,
    @Inject() private readonly cipherService: CipherService,
    @Inject('REFRESH_TOKEN_HASH_SERVICE')
    private readonly hashService: HashService,
  ) {
    this.config = config.auth;
  }

  async generate(session_id: string) {
    const id = randomUUID();
    const expires_at = add(
      new Date(),
      this.config.refresh_token_duration ?? { days: 10 },
    );
    const token = this.cipherService.encrypt(
      `${id}|${session_id}|${expires_at.getTime()}`,
    );
    const hash = await this.hashService.hash(token);

    return {
      id,
      token,
      hash,
      expires_at,
    };
  }

  verify(token: string) {
    try {
      const plain = this.cipherService.decrypt(token);
      const [id, session_id] = plain.split('|');
      return {
        id,
        session_id,
      };
    } catch (error) {
      throw new ErrorTokenException('Invalid refresh token', { cause: error });
    }
  }

  async verifyHash(hash: string, token: string) {
    try {
      return await this.hashService.verify(hash, token);
    } catch (error) {
      throw new ErrorTokenException('Invalid token', { cause: error });
    }
  }
}
