export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: { field: string; message: string }[];
  timestamp: string;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(
  error: string,
  message: string,
  errors?: { field: string; message: string }[],
): ApiResponse<never> {
  return {
    success: false,
    error,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): ApiResponse<T[]> & {
  pagination: { total: number; page: number; pageSize: number; pages: number };
} {
  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
    },
    timestamp: new Date().toISOString(),
  };
}
