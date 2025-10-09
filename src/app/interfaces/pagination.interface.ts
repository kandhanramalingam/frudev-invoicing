export interface PaginationRequest {
  page: number;
  size: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  data: T[];
  totalRecords: number;
  page: number;
  size: number;
}