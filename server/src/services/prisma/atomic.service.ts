import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

export type Tx = Prisma.TransactionClient;

@Injectable()
export class PrismaAtomicService {
  constructor(@Inject() private readonly prisma: PrismaService) {}

  async tx<R>(closure: (tx: Tx) => Promise<R>): Promise<R> {
    return await this.prisma.$transaction(closure);
  }
}
