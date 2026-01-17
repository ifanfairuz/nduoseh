import { DynamicModule, Module, Type } from '@nestjs/common';
import { AppConfig } from './app.config';
import { UserConfig } from './modules/user/config';
import { UserModule } from './modules/user/user.module';
import { LocalStorageModule } from './services/storage/local-storage.module';
import { UserImageDisk } from './modules/user/storage/user-image.disk';

@Module({})
export class LoaderModule {
  static configure(config: AppConfig): DynamicModule {
    const { modules, permissions } = this._mapModules(config);
    return {
      module: LoaderModule,
      global: true,
      providers: [
        {
          provide: 'APP_PERMISSIONS',
          useValue: permissions,
        },
      ],
      exports: ['APP_PERMISSIONS'],
      imports: [
        ...modules,

        // end of imports
        LocalStorageModule.registerServer([UserImageDisk]),
      ],
    };
  }

  static _mapModules(config: AppConfig) {
    const permissions: string[] = [];
    const map = {
      user: (config?: unknown) => {
        permissions.push(...UserModule.permissions);
        return UserModule.configure(config as UserConfig | undefined);
      },
    };

    let hasUser = false;
    const modules: (DynamicModule | Type<UserModule>)[] = [];

    for (const module of config.modules) {
      if (typeof module === 'string') {
        if (module in map) {
          modules.push(map[module as keyof typeof map]());
        }
        if (module == 'user') hasUser = true;
      } else if (typeof module[0] === 'string') {
        const config = module[1];
        if (config) {
          modules.push(map[module[0] as keyof typeof map](config));
        } else {
          modules.push(map[module[0] as keyof typeof map]());
        }

        if (module[0] == 'user') hasUser = true;
      }
    }

    // always register user
    if (!hasUser) {
      modules.unshift(map.user());
    }

    return {
      permissions,
      modules,
    };
  }
}
