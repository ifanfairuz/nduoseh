import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './services/prisma/prisma.module';
import { RedisModule } from './services/redis/redis.module';
import { UserModule } from './modules/user/user.module';
import { EventModule } from './services/event/event.module';
import { HealthCheckModule } from './modules/health-check/health-check.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    PrismaModule,
    RedisModule,
    EventModule,
    HealthCheckModule,
    UserModule,
  ],
})
export class AppModule {}
