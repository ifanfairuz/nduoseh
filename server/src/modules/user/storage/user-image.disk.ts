import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ServeStaticModuleOptions } from '@nestjs/serve-static';
import { Response } from 'express';
import { join } from 'path';
import { Disk } from 'src/services/storage/contract/disk';
import type { StorageService } from 'src/services/storage/contract/storage.service';

@Injectable()
export class UserImageDisk extends Disk implements OnApplicationBootstrap {
  constructor(@Inject('USER_IMAGE_STORAGE_DRIVER') driver: StorageService) {
    super(driver);
  }

  protected readonly name: string = 'userimage';

  async onApplicationBootstrap() {
    await this.initiateDiskFolder();
  }

  getServeStaticOptions(): ServeStaticModuleOptions {
    const base_path = join(this.driver.getBasePath(true), this.name);

    return {
      rootPath: base_path,
      serveRoot: `/${this.name}`,
      serveStaticOptions: {
        extensions: ['png', 'jpg', 'jpeg', 'heic', 'webp', 'gif'],
        dotfiles: 'ignore',
        index: false,
        cacheControl: true,
        etag: true,
        lastModified: true,
        maxAge: 31536000,
        fallthrough: false,
        setHeaders: (res: Response) => {
          res
            .set('Access-Control-Allow-Origin', '*')
            .set('Access-Control-Allow-Methods', 'GET')
            .set('Access-Control-Allow-Headers', [
              'E-Tag',
              'If-None-Match',
              'Accept',
              'User-Agent',
            ]);
        },
      },
    };
  }
}
