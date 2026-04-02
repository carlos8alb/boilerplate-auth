import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("El email es requerido y debe ser válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const RegisterSchema = z.object({
  email: z.string().email("El email es requerido y debe ser válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  lastName: z
    .string()
    .min(1, "El apellido es requerido")
    .max(100, "El apellido no puede exceder 100 caracteres"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("El email es requerido y debe ser válido"),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "El token es requerido"),
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const ResendVerificationSchema = z.object({
  email: z.string().email("El email es requerido y debe ser válido"),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
