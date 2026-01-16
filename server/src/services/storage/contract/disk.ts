import { join } from 'path';
import { SaveOptions, StorageService } from './storage.service';
import { XFile } from './xfile';
import { ServeStaticModuleOptions } from '@nestjs/serve-static';
import { LocalStorageService } from '../local-storage.service';

export abstract class Disk {
  constructor(protected readonly driver: StorageService) {}

  protected abstract readonly name: string;

  async save(
    buffer: Buffer,
    options?: Omit<SaveOptions, 'diskName'>,
  ): Promise<XFile> {
    return this.driver.save(buffer, this.name, {
      ...options,
      diskName: this.name,
    });
  }

  async replace(
    path: string,
    buffer: Buffer,
    options?: Omit<SaveOptions, 'diskName'>,
  ): Promise<XFile> {
    return this.driver.replace(join(this.name, path), buffer, {
      ...options,
      diskName: this.name,
    });
  }

  async get(path: string): Promise<XFile> {
    return this.driver.get(join(this.name, path), {
      diskName: this.name,
    });
  }

  async delete(path: string): Promise<void> {
    return this.driver.delete(join(this.name, path), {
      diskName: this.name,
    });
  }

  getServeStaticOptions(): ServeStaticModuleOptions {
    throw new Error('Method not implemented or not exposed disk');
  }

  async initiateDiskFolder() {
    if (this.driver instanceof LocalStorageService) {
      await this.driver.createDir(this.name);
    }
  }
}
