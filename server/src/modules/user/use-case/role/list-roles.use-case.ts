import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';
import type { OffsetPaginatedResult, SortQueries, Role } from '@panah/contract';
import { fromQueries } from 'src/services/prisma/prisma.util';

export interface ListRolesParams {
  page?: number;
  limit?: number;
  keyword?: string;
  sort?: SortQueries;
}

@Injectable()
export class ListRolesUseCase {
  constructor(@Inject() private readonly prisma: PrismaService) {}

  async execute(
    params: ListRolesParams = {},
  ): Promise<OffsetPaginatedResult<Role>> {
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
            slug: {
              contains: keyword,
              mode: 'insensitive' as const,
            },
          },
          {
            description: {
              contains: keyword,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    // Build order by
    let orderBy: Prisma.RoleOrderByWithRelationInput[] = [
      {
        created_at: 'desc',
      },
    ];
    if (sort && sort.length > 0) {
      orderBy = fromQueries(sort, ['id', 'name', 'slug', 'created_at']);
    }

    // Get total count and roles in parallel
    const [total, roles] = await Promise.all([
      this.prisma.role.count({
        where,
      }),
      this.prisma.role.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          permissions: true,
          is_system: true,
          active: true,
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
      data: roles as Role[],
      pagination: {
        page: currentPage,
        limit: take,
        total,
        totalPages,
      },
    };
  }
}
