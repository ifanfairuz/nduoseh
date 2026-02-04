import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';
import type {
  OffsetPaginatedResult,
  SortQueries,
  Role,
} from '@nduoseh/contract';
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

    // Build order by
    let orderBy: Prisma.RoleOrderByWithRelationInput[] = [
      {
        created_at: 'desc',
      },
    ];
    if (sort && sort.length > 0) {
      orderBy = fromQueries(sort, ['id', 'name', 'slug', 'created_at']);
    }

    let take: number | undefined;
    let currentPage: number | undefined;
    let skip: number | undefined;
    let where: Prisma.RoleWhereInput | undefined;

    if (limit > 0) {
      // Ensure limit is within bounds (1-100)
      take = Math.min(Math.max(limit, 1), 100);
      // Ensure page is at least 1
      currentPage = Math.max(page, 1);
      // Calculate skip
      skip = (currentPage - 1) * take;

      // Build where clause with keyword search
      where = {
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
    }

    // Get total count and roles in parallel
    const [total, roles] = await Promise.all([
      (async () => {
        if (limit > 0) {
          return await this.prisma.role.count({
            where,
          });
        }

        return 0;
      })(),
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
    const totalPages =
      typeof take !== 'undefined' ? Math.ceil(total / take) : roles.length;

    return {
      data: roles as Role[],
      pagination: {
        page: currentPage ?? 1,
        limit: take ?? totalPages,
        total,
        totalPages,
      },
    };
  }
}
