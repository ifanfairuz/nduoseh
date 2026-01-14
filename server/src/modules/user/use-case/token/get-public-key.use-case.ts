import { randomBytes } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '../../services/jwt.service';

@Injectable()
export class GetPublicKeyUseCase {
  private _current: {
    etag: string;
    key: unknown;
  } = {
    etag: '',
    key: null,
  };

  public get etag() {
    return this._current.etag;
  }

  constructor(
    @Inject()
    private readonly jwt: JwtService,
  ) {}

  /**
   * Get exported public key
   *
   * @returns
   */
  async execute() {
    if (this._current.key) {
      return this._current;
    }

    this._current.etag = randomBytes(8).toString('hex');
    this._current.key = await this.jwt.getPublicKey();
    return this._current;
  }
}
