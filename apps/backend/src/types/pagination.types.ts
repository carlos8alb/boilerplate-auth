export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export function encodeCursor(offset: number): string {
  return Buffer.from(offset.toString()).toString("base64");
}

export function decodeCursor(cursor: string): number {
  return parseInt(Buffer.from(cursor, "base64").toString("utf-8"), 10);
}

export function getPaginationParams(
  page?: number,
  pageSize?: number,
): PaginationParams {
  return {
    page: Math.max(1, page || 1),
    pageSize: Math.min(100, Math.max(1, pageSize || 20)),
  };
}
