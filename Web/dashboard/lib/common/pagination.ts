export interface SearchRequest {
  pageIndex: number;
  pageSize: number;
  orderBy?: string;
  orderByExpression?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
