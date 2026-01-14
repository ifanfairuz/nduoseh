import { readFileSync } from 'fs';
import { createPublicKey, createPrivateKey, KeyObject } from 'crypto';
import { Injectable } from '@nestjs/common';

export interface KeyProviderOptions {
  privateKey?: string;
  privateKeyPath?: string;
  privateKeyPassphrase?: string;

  publicKey?: string;
  publicKeyPath?: string;
}

function getContent(options: {
  fromString?: string;
  fromPath?: string;
  env?: string;
  envPath?: string;
  defaultPath?: string;
}) {
  if (options.fromString) {
    return Buffer.from(options.fromString, 'utf-8');
  }

  if (options.fromPath) {
    return readFileSync(options.fromPath);
  }

  if (options.env) {
    const env = process.env[options.env];
    if (env) {
      return Buffer.from(env, 'utf-8');
    }
  }

  if (options.envPath) {
    const env = process.env[options.envPath];
    if (env) {
      return readFileSync(env);
    }
  }

  if (options.defaultPath) {
    return readFileSync(options.defaultPath);
  }

  throw new Error(
    `Key not found, Please set env ${[options.env, options.envPath].filter(Boolean).join(' or ')}`,
  );
}

@Injectable()
export class KeyService {
  private readonly _privateKey: KeyObject;
  private readonly _publicKey: KeyObject;

  constructor(options?: KeyProviderOptions) {
    const priv_key = getContent({
      fromString: options?.privateKey,
      fromPath: options?.privateKeyPath,
      env: 'PRIVATE_KEY',
      envPath: 'PRIVATE_KEY_PATH',
      defaultPath: 'pkey.pem',
    });

    const passphrase = getContent({
      fromString: options?.privateKeyPassphrase,
      env: 'PRIVATE_KEY_PASSPHRASE',
    });
    this._privateKey = createPrivateKey({ key: priv_key, passphrase });

    const pub_key = getContent({
      fromString: options?.publicKey,
      fromPath: options?.publicKeyPath,
      env: 'PUBLIC_KEY',
      envPath: 'PUBLIC_KEY_PATH',
      defaultPath: 'pubkey.pem',
    });
    this._publicKey = createPublicKey(pub_key);
  }

  /**
   * Get public key
   *
   * @returns
   */
  get publicKey() {
    return this._publicKey;
  }

  /**
   * Get private key
   *
   * @returns
   */
  get privateKey() {
    return this._privateKey;
  }
}
