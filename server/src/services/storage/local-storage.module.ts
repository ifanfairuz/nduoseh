import { DynamicModule, Global, InjectionToken, Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Disk } from './contract/disk';

@Global()
@Module({
  providers: [LocalStorageService],
  exports: [LocalStorageService],
})
export class LocalStorageModule {
  static registerServer(diskTokens: InjectionToken[]): DynamicModule {
    return ServeStaticModule.forRootAsync({
      useFactory: (...disk: unknown[]) => {
        return disk
          .filter((disk) => disk instanceof Disk)
          .map((disk) => disk.getServeStaticOptions());
      },
      inject: diskTokens.map((disk) => ({
        token: disk,
        optional: true,
      })),
    });
  }
}
