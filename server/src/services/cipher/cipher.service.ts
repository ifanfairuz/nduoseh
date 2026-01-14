import {
  constants,
  createCipheriv,
  createDecipheriv,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
} from 'crypto';
import { KeyService } from './key.service';
import { Inject, Injectable } from '@nestjs/common';

export interface EncryptionOptions {
  aad?: {
    type: string;
    ts: number;
  };
}

interface Envelope {
  v: number;
  alg: string;
  wrc: string;
  iv: string;
  cpt: string;
  tag: string;
  aad?: string;
}

@Injectable()
export class CipherService {
  constructor(@Inject() private readonly _key: KeyService) {}

  /**
   * generate CEK
   *
   * @returns {Buffer}
   */
  private _generateCEK() {
    return randomBytes(32);
  }

  /**
   * Encrypt string v1
   *
   * @param {string} text
   * @returns {Promise<string>}
   */
  public encryptV1(text: string, options?: EncryptionOptions): string {
    const cek = this._generateCEK();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', cek, iv, {
      authTagLength: 16,
    });
    const aad = options?.aad
      ? Buffer.from(JSON.stringify(options.aad), 'utf-8')
      : null;
    if (aad) {
      cipher.setAAD(aad);
    }

    const ciphertext = Buffer.concat([cipher.update(text), cipher.final()]);
    const tag = cipher.getAuthTag();
    cipher.destroy();

    const wrapped_cek = publicEncrypt(
      {
        key: this._key.publicKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      cek,
    );
    cek.fill(0);

    const envelope: Envelope = {
      v: 1,
      alg: 'RSA-OAEP-SHA256+A256GCM',
      wrc: Buffer.from(wrapped_cek).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      cpt: Buffer.from(ciphertext).toString('base64'),
      tag: Buffer.from(tag).toString('base64'),
    };
    if (aad) {
      envelope.aad = Buffer.from(aad).toString('base64');
    }

    return Buffer.from(JSON.stringify(envelope)).toString('base64');
  }

  /**
   * Encrypt string
   *
   * @param {string} text
   * @returns {string}
   */
  public encrypt(text: string, options?: EncryptionOptions): string {
    return this.encryptV1(text, options);
  }

  /**
   * Decrypt string
   *
   * @param {Envelope} payload
   * @returns {string}
   */
  private decryptV1(payload: Envelope): string {
    const wrapped_cek = Buffer.from(payload.wrc, 'base64');
    const iv = Buffer.from(payload.iv, 'base64');
    const ciphertext = Buffer.from(payload.cpt, 'base64');
    const tag = Buffer.from(payload.tag, 'base64');
    const aad = payload.aad ? Buffer.from(payload.aad, 'base64') : null;
    const cek = privateDecrypt(
      {
        key: this._key.privateKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      wrapped_cek,
    );

    try {
      const decipher = createDecipheriv('aes-256-gcm', cek, iv, {
        authTagLength: 16,
      });
      if (aad) decipher.setAAD(aad);
      decipher.setAuthTag(tag);

      const text = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]).toString('utf-8');

      decipher.destroy();
      return text;
    } finally {
      cek.fill(0);
    }
  }

  /**
   * Decrypt string v1
   *
   * @param {string} encrypted
   * @returns {string}
   */
  public decrypt(encrypted: string): string {
    try {
      const payload = JSON.parse(
        Buffer.from(encrypted, 'base64').toString('utf-8'),
      ) as Envelope;

      if (payload.v == 1) {
        return this.decryptV1(payload);
      }

      throw new Error('Invalid version');
    } catch (error) {
      throw new Error('Decryption failed', { cause: error });
    }
  }
}
