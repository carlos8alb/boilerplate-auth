export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  roleId: string;
  role: Role;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  timestamp: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  timestamp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ErrorResponse {
  message: string;
  error?: string;
  errors?: { [key: string]: string[] };
  timestamp: string;
}