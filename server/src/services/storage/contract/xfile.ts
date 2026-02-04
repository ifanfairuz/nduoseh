import assert from 'assert';
import { join } from 'path';

export interface XFileOptions {
  identifier: string;
  path: string;
  url: string;
}

export class XFile {
  /**
   * Create file from path
   *
   * @returns {XFile}
   */
  static fromLocal(path: string, base_storage_path: string, diskName?: string) {
    return new XFile({
      path: join(base_storage_path, path),
      url: path,
      identifier: diskName ? path.replace(diskName, '') : path,
    });
  }

  /**
   * Absolute path
   *
   * @private
   * @var {string}
   */
  private readonly _path: string;
  get path() {
    return this._path;
  }

  /**
   * Relative url
   *
   * @private
   * @var {string}
   */
  private readonly _url: string;
  get url() {
    return this._url;
  }

  /**
   * Identifier
   *
   * @var {string}
   */
  private readonly _identifier: string;
  get identifier() {
    return this._identifier;
  }

  constructor(options: XFileOptions) {
    this._path = options.path;
    this._url = options.url;
    this._identifier = options.identifier;

    assert(this._path || this._url, 'Either path or url must be set');
  }

  /**
   * Get public url
   *
   * @returns {string}
   */
  async getUrl(baseUrl?: string) {
    if (this._url) {
      const _baseUrl = baseUrl ?? process.env.BASE_URL ?? '';

      // If no base URL, return the relative URL
      if (!_baseUrl) {
        return Promise.resolve(this._url);
      }

      // Normalize base URL - remove trailing slashes (avoid ReDoS)
      let normalizedBase = _baseUrl;
      while (normalizedBase.endsWith('/')) {
        normalizedBase = normalizedBase.slice(0, -1);
      }

      // Normalize relative URL - ensure it starts with /
      const normalizedUrl = this._url.startsWith('/')
        ? this._url
        : `/${this._url}`;

      // Join with single slash
      return Promise.resolve(`${normalizedBase}${normalizedUrl}`);
    }

    return Promise.reject(
      new Error('Unimplemented get url without relative url'),
    );
  }
}
