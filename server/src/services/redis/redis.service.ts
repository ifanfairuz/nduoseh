import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService
  extends Redis
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    super(process.env.REDIS_URL ?? '', { lazyConnect: true });

    this.on('connect', () => {
      this.logger.log('Connected to redis');
    });

    this.on('close', () => {
      this.logger.log('Disconnected from redis');
    });
  }

  async onApplicationBootstrap() {
    try {
      await this.connect();
    } catch (error) {
      this.logger.error('Failed to connect redis', error);
    }
  }

  async onApplicationShutdown() {
    await this.quit();
  }
}
