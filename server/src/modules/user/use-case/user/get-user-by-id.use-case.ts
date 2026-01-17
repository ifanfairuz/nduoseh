import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class GetUserByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
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
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
