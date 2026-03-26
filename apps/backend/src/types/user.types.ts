export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | undefined;
  roleId: string;
  role?: {
    id: string;
    name: string;
  };
  passwordHash: string;
  isEmailVerified?: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpiry?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpiry?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: Omit<User, "passwordHash">;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}
