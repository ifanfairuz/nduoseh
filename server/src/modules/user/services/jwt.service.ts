import {
  type GenerateKeyPairResult,
  JWTVerifyOptions,
  SignJWT,
  exportJWK,
  generateKeyPair,
  jwtVerify,
} from 'jose';
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

export async function createKeyPair(): Promise<GenerateKeyPairResult> {
  return await generateKeyPair('EdDSA', { crv: 'Ed25519' });
}

@Injectable()
export class JwtService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private key_pair: GenerateKeyPairResult | null = null;

  async onApplicationBootstrap() {
    this.key_pair = await createKeyPair();
  }

  onApplicationShutdown() {
    this.key_pair = null;
  }

  /**
   * Generate JWT token
   *
   * @param {Record<string, unknown>} payload
   * @returns {Promise<string>}
   */
  async generateToken(payload: Record<string, unknown>) {
    if (!this.key_pair) {
      throw new Error('Key pair not found');
    }

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'EdDSA', typ: 'JWT' })
      .setIssuedAt()
      .sign(this.key_pair.privateKey);
  }

  /**
   * Verify token
   *
   * @param {string} token
   * @returns
   */
  async verifyToken(token: string, options?: JWTVerifyOptions) {
    if (!this.key_pair) {
      throw new Error('Key pair not found');
    }

    const { payload } = await jwtVerify(
      token,
      this.key_pair.publicKey,
      options,
    );
    return payload;
  }

  /**
   * Verify token
   *
   * @param {string} token
   * @returns
   */
  async verifyTokenWithKey(
    publicKey: CryptoKey,
    token: string,
    options?: JWTVerifyOptions,
  ) {
    const { payload } = await jwtVerify(token, publicKey, options);
    return payload;
  }

  /**
   * get public key as json
   *
   * @returns {Promise<string>}
   */
  async getPublicKey() {
    if (!this.key_pair) {
      throw new Error('Key pair not found');
    }

    return await exportJWK(this.key_pair.publicKey);
  }
}
