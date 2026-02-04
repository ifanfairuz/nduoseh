import { add } from 'date-fns';
import { JWTPayload } from 'jose';
import { Inject, Injectable } from '@nestjs/common';
import type { AuthConfig, UserConfig } from '../config';
import { JwtService } from './jwt.service';
import { HashService } from 'src/services/cipher/hash.service';
import { ErrorTokenException } from '../exceptions/ErrorTokenException';
import { ClientInfo } from '@nduoseh/contract';

export interface TokenPayload extends JWTPayload {
  sub: string;
  sid: string;
  exp: number;
  iss: string;
  iat: number;
  aud?: string;
}

@Injectable()
export class AccessTokenService {
  private readonly config: AuthConfig;

  constructor(
    @Inject('USER_CONFIG') config: UserConfig,
    @Inject() private readonly jwtService: JwtService,
    @Inject('ACCESS_TOKEN_HASH_SERVICE')
    private readonly hashService: HashService,
  ) {
    this.config = config.auth;
  }

  async generate(
    user_id: string,
    session_id: string,
    options: ClientInfo = {},
  ) {
    const expires_at = add(
      new Date(),
      this.config.access_token_duration ?? { minutes: 10 },
    );

    const token = await this.jwtService.generateToken({
      sub: user_id,
      sid: session_id,
      exp: Math.floor(expires_at.getTime() / 1000),
      aud: options.device_id ?? options.ip_address ?? options.user_agent,
      iss: this.config.server_name,
    });
    const hash = await this.hashService.hash(token);

    return {
      token,
      hash,
      expires_at,
    };
  }

  async verify(
    token: string,
    audience: string[],
    publicKey?: CryptoKey,
  ): Promise<TokenPayload> {
    try {
      let result: JWTPayload;

      if (typeof publicKey === 'undefined') {
        result = await this.jwtService.verifyToken(token, {
          audience: audience.length ? audience : undefined,
          issuer: this.config.server_name,
        });
      } else {
        result = await this.jwtService.verifyTokenWithKey(publicKey, token, {
          audience: audience.length ? audience : undefined,
          issuer: this.config.server_name,
        });
      }

      return result as TokenPayload;
    } catch (error) {
      throw new ErrorTokenException('Invalid token', { cause: error });
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
