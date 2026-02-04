import { XFile } from './xfile';

export interface DiskOptions {
  diskName?: string;
}

export interface SaveOptions extends DiskOptions {
  name?: string;
  mime?: string;
}

export interface StorageService {
  /**
   * Save Buffer to storage
   *
   * @param {Buffer} buffer
   * @param {string} target - target path
   * @returns {Promise<XFile>}
   */
  save(buffer: Buffer, target: string, options?: SaveOptions): Promise<XFile>;

  /**
   * Replace file
   *
   * @param {Buffer} buffer
   * @param {string} path - file path
   * @returns {Promise<XFile>}
   */
  replace(path: string, buffer: Buffer, options?: SaveOptions): Promise<XFile>;

  /**
   * Get file
   *
   * @param {string} path
   * @returns {Promise<XFile>}
   */
  get(path: string, options?: DiskOptions): Promise<XFile>;

  /**
   * Delete file
   *
   * @param {string} path
   * @returns {Promise<void>}
   */
  delete(path: string, options?: DiskOptions): Promise<void>;

  /**
   * Get base path
   *
   * @param {boolean} absolute
   * @returns {string}
   */
  getBasePath(absolute?: boolean): string;
}
