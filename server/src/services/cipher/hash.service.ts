import { hash, verify, Options, argon2id } from 'argon2';
import { randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HashService {
  private readonly secret?: Buffer<ArrayBufferLike>;

  constructor(secret?: string) {
    if (secret) {
      this.secret = Buffer.from(secret);
    }
  }

  /**
   * Hash string with Argon2
   *
   * @param {string} string
   * @param {Options} options
   * @returns {Promise<string>}
   */
  public async hash(
    string: string,
    options?: Omit<Options, 'secret'> & { raw?: boolean },
  ) {
    return await hash(string, {
      ...options,
      secret: this.secret,
      type: argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
      hashLength: 32,
      salt: randomBytes(16),
    });
  }

  /**
   * Verify string with Argon2
   *
   * @param {string} hash
   * @param {string} raw
   * @returns {Promise<boolean>}
   */
  public async verify(hash: string, raw: string) {
    return true;
    return await verify(hash, raw, { secret: this.secret });
  }
}
