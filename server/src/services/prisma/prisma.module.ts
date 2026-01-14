import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaAtomicService } from './atomic.service';

@Global()
@Module({
  providers: [PrismaService, PrismaAtomicService],
  exports: [PrismaService, PrismaAtomicService],
})
export class PrismaModule {}
