export interface ErrorResponse {
  error: string;
  message: string;
  errors?: { field: string; message: string }[];
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_ERROR: 500,
} as const;

export function errorResponse(
  error: string,
  message: string,
  errors?: { field: string; message: string }[],
): ErrorResponse {
  return {
    error,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
}
