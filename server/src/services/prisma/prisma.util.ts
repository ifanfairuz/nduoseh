import { Prisma } from '@prisma/client';
import { SortQueries } from '@nduoseh/contract';

export function fromQueries<T extends Record<string, Prisma.SortOrder>[]>(
  query: SortQueries,
  allows: (keyof T[0])[],
): T {
  const res: Record<string, Prisma.SortOrder>[] = [];
  for (let i = 0; i < query.length; i++) {
    const id = query[i];
    const next = query[i + 1];
    const order = next == 'desc' ? 'desc' : 'asc';

    if (allows.includes(id)) {
      res.push({ [id]: order });
    }

    if (next == 'desc' || next == 'asc') {
      i++;
    }
  }

  return res as T;
}
