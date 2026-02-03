import http from "@/api/http";
import type { QueryTableContext } from "@/components/datatable";
import type { User, OffsetPaginatedResult } from "@panah/contract";

export async function getUsers(
  ctx?: QueryTableContext,
): Promise<OffsetPaginatedResult<User>> {
  const res = await http.get<OffsetPaginatedResult<User>>("/users", {
    params: {
      limit: ctx?.pagination?.limit,
      page: ctx?.pagination?.page,
      sort: ctx?.sort,
      keyword: ctx?.keyword,
    },
  });
  return res.data;
}
