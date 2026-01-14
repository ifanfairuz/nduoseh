import { Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

export interface PrismaMethodOptions {
  tx?: Prisma.TransactionClient;
}

export class PrismaRepository {
  @Inject()
  protected _prisma: PrismaService;

  protected _client(options?: PrismaMethodOptions) {
    return options?.tx ?? this._prisma;
  }
}
