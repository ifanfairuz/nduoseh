import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './services/prisma/prisma.module';
import { RedisModule } from './services/redis/redis.module';
import { EventModule } from './services/event/event.module';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { LocalStorageModule } from './services/storage/local-storage.module';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { resolveConfig } from './app.config';
import { LoaderModule } from './loader.module';

const config = resolveConfig();

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
    LoaderModule.configure(config),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
  ],
})
export class AppModule {}
