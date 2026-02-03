import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UserImageDisk } from '../../storage/user-image.disk';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject() private readonly prisma: PrismaService,
    @Inject() private readonly disk: UserImageDisk,
  ) {}

  async execute(userId: string, domain?: string) {
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

    return {
      ...user,
      image: await (
        user.image ? await this.disk.get(user.image) : undefined
      )?.getUrl(domain),
    };
  }
}
