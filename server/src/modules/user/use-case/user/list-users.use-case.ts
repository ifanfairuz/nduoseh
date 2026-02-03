import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';
import type { OffsetPaginatedResult, SortQueries, User } from '@panah/contract';
import { fromQueries } from 'src/services/prisma/prisma.util';
import { UserImageDisk } from '../../storage/user-image.disk';

export interface ListUsersParams {
  page?: number;
  limit?: number;
  keyword?: string;
  sort?: SortQueries;
}

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject() private readonly prisma: PrismaService,
    @Inject() private readonly disk: UserImageDisk,
  ) {}

  async execute(
    params: ListUsersParams = {},
    domain?: string,
  ): Promise<OffsetPaginatedResult<User>> {
    const { page = 1, limit = 10, keyword, sort } = params;

    // Ensure limit is within bounds (1-100)
    const take = Math.min(Math.max(limit, 1), 100);

    // Ensure page is at least 1
    const currentPage = Math.max(page, 1);

    // Calculate skip
    const skip = (currentPage - 1) * take;

    // Build where clause with keyword search
    const where = {
      deleted_at: null,
      ...(keyword && {
        OR: [
          {
            name: {
              contains: keyword,
              mode: 'insensitive' as const,
            },
          },
          {
            email: {
              contains: keyword,
              mode: 'insensitive' as const,
            },
          },
          {
            callname: {
              contains: keyword,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    // Build order by
    let orderBy: Prisma.UserOrderByWithRelationInput[] = [
      {
        created_at: 'asc',
      },
    ];
    if (sort && sort.length > 0) {
      orderBy = fromQueries(sort, ['id', 'name', 'email', 'callname']);
    }

    // Get total count and users in parallel
    const [total, users] = await Promise.all([
      this.prisma.user.count({
        where,
      }),
      this.prisma.user.findMany({
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
        where,
        orderBy,
        skip,
        take,
      }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / take);

    return {
      data: await Promise.all(
        users.map(async (u) => ({
          ...u,
          image: await this.getImageUrl(u.image, domain),
        })),
      ),
      pagination: {
        page: currentPage,
        limit: take,
        total,
        totalPages,
      },
    };
  }

  async getImageUrl(image: string | null, domain?: string) {
    if (!image) return null;
    if (image.startsWith('http')) return image;

    const file = await this.disk.get(image);
    return await file.getUrl(domain);
  }
}
