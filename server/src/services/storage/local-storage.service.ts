import { Stats } from 'fs';
import { randomUUID } from 'crypto';
import { writeFile, rm, stat, mkdir } from 'fs/promises';
import { isAbsolute, join, resolve } from 'path';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Traced } from 'src/utils/otel';
import { XFile } from './contract/xfile';
import type {
  DiskOptions,
  SaveOptions,
  StorageService,
} from './contract/storage.service';

function parseToAbsolute(path: string) {
  if (isAbsolute(path)) {
    return path;
  }

  return resolve(__dirname, '..', '..', '..', path);
}

@Injectable()
export class LocalStorageService
  implements StorageService, OnApplicationBootstrap
{
  /**
   * Base path (relative)
   *
   * @private
   */
  private readonly _base_path_relative: string;

  /**
   * Base path (absolute)
   *
   * @private
   */
  private readonly _base_path: string;

  constructor() {
    this._base_path_relative = process.env.STORAGE_PATH ?? 'storage';
    this._base_path = parseToAbsolute(this._base_path_relative);
  }

  async onApplicationBootstrap() {
    await this.createDir();
  }

  /**
   * create directory
   *
   * @param {string} path
   * @returns {Promise<void>}
   */
  async createDir(path?: string): Promise<void> {
    const _path = path ? join(this._base_path, path) : this._base_path;
    await mkdir(_path, { recursive: true });
  }

  @Traced('storage.local.save')
  async save(
    buffer: Buffer,
    target: string,
    options?: SaveOptions,
  ): Promise<XFile> {
    const name = options?.name ?? randomUUID();
    const path = join(target, name);

    await writeFile(join(this._base_path, path), buffer, { flag: 'w+' });
    return XFile.fromLocal(path, this._base_path, options?.diskName);
  }

  @Traced('storage.local.replace')
  async replace(
    path: string,
    buffer: Buffer,
    options?: SaveOptions,
  ): Promise<XFile> {
    await writeFile(join(this._base_path, path), buffer, { flag: 'w+' });
    return XFile.fromLocal(path, this._base_path, options?.diskName);
  }

  @Traced('storage.local.get')
  get(path: string, options?: DiskOptions): Promise<XFile> {
    return Promise.resolve(
      XFile.fromLocal(path, this._base_path, options?.diskName),
    );
  }

  @Traced('storage.local.delete')
  async delete(path: string): Promise<void> {
    const _path = join(this._base_path, path);

    let info: Stats;
    try {
      info = await stat(_path);
    } catch {
      return;
    }

    if (info.isFile()) {
      await rm(_path);
    }
  }

  getBasePath(absolute?: boolean): string {
    return absolute ? this._base_path : this._base_path_relative;
  }
}
