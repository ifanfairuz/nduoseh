// Cursor-based pagination
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pageInfo: PageInfo;
}

// Offset-based pagination
export interface OffsetPageInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OffsetPaginationParams {
  page?: number;
  limit?: number;
}

export interface OffsetPaginatedResult<T> {
  data: T[];
  pagination: OffsetPageInfo;
}
