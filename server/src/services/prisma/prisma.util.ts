import { Prisma } from '@prisma/client';
import { SortQueries } from '@nduoseh/contract';

/**
 * Maximum number of sort fields allowed to prevent DoS attacks
 */
const MAX_SORT_FIELDS = 10;

export function fromQueries<T extends Record<string, Prisma.SortOrder>[]>(
  query: SortQueries,
  allows: (keyof T[0])[],
): T {
  const res: Record<string, Prisma.SortOrder>[] = [];

  // Prevent loop bound injection by limiting the number of iterations
  const maxIterations = Math.min(query.length, MAX_SORT_FIELDS * 2);

  for (let i = 0; i < maxIterations; i++) {
    const id = query[i];
    const next = i + 1 < maxIterations ? query[i + 1] : undefined;
    const order = next == 'desc' ? 'desc' : 'asc';

    if (allows.includes(id)) {
      res.push({ [id]: order });

      // Stop if we've reached the maximum number of sort fields
      if (res.length >= MAX_SORT_FIELDS) {
        break;
      }
    }

    if (next == 'desc' || next == 'asc') {
      i++;
    }
  }

  return res as T;
}
