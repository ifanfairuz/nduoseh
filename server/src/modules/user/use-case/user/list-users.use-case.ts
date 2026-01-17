import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    return this.prisma.user.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        email_verified: true,
        image: true,
        callname: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
