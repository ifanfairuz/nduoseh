import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './services/prisma/prisma.module';
import { RedisModule } from './services/redis/redis.module';
import { UserModule } from './modules/user/user.module';
import { EventModule } from './services/event/event.module';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { LocalStorageModule } from './services/storage/local-storage.module';
import { UserImageDisk } from './modules/user/storage/user-image.disk';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        formatters: {
          level(label) {
            return { level: label };
          },
        },
      },
    }),
    LocalStorageModule,
    PrismaModule,
    RedisModule,
    EventModule,
    HealthCheckModule,
    UserModule,

    // end of modules
    LocalStorageModule.registerServer([UserImageDisk]),
  ],
})
export class AppModule {}
