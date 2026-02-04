import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnApplicationShutdown
{
  private readonly _logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
      log: [
        {
          emit: 'stdout',
          level: 'query',
        },
      ],
    });
  }

  /**
   * Test connection
   *
   * @returns {Promise<boolean>} true if connection is ok
   */
  public async testConnection() {
    try {
      await this.$queryRaw`SELECT 1;`;
      return true;
    } catch (error) {
      this._logger.error('error testConnection', error);
      return false;
    }
  }

  async onApplicationShutdown() {
    await this.$disconnect();
  }
}
