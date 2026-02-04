import type { UseQueryReturnType } from "@tanstack/vue-query";
import type { SortingState } from "@tanstack/vue-table";

export interface DataTablePagination {
  totalPages: number;
  total: number;
  limit: number;
  page: number;
}

export const DEFAULT_PAGINATION = {
  totalPages: 1,
  total: 0,
  limit: 10,
  page: 1,
};

export type QueryTableQuery<T> = UseQueryReturnType<T, Error>;

export interface QueryTableContext {
  pagination?: {
    limit?: number;
    page?: number;
  };
  sort?: ReturnType<typeof toSortQueries>;
  keyword?: string;
}

export interface QueryTableFetchResponse<T> {
  data: T[];
  pagination?: DataTablePagination;
}

export interface QueryTableState {
  limit: number;
  page: number;
  sort: SortingState;
  keyword?: string;
}

export function toSortQueries(state: SortingState) {
  return state.flatMap((s) => [s.id, s.desc ? "desc" : "asc"]);
}
