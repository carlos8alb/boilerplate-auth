import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { jwtService } from "../services/jwt.service";
import { emailService } from "../services/email.service";
import { AuthResponse } from "../types/user.types";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ResendVerificationSchema,
} from "../schemas/user.schema";
import { HTTP_STATUS } from "../types/error.types";
import { successResponse, errorResponse } from "../types/api-response.types";

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = RegisterSchema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            errorResponse(
              "ValidationError",
              "La validación de la solicitud falló",
              errors,
            ),
          );
        return;
      }

      const { email, password, firstName, lastName } = result.data;

      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        res
          .status(HTTP_STATUS.CONFLICT)
          .json(errorResponse("Conflict", "El usuario ya existe"));
        return;
      }

      const user = await userService.create(
        email,
        password,
        firstName,
        lastName,
      );

      if (!user) {
        res
          .status(HTTP_STATUS.INTERNAL_ERROR)
          .json(errorResponse("InternalError", "Error al crear el usuario"));
        return;
      }

      const token = await userService.setEmailVerificationToken(user.id);

      if (token) {
        await emailService.sendVerificationEmail(email, token);
      }

      const accessToken = jwtService.generateToken({
        userId: user.id,
        email: user.email,
      });
      const refreshToken = jwtService.generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      const { passwordHash: _, ...userWithoutPassword } = user;
      const response: AuthResponse = {
        accessToken,
        refreshToken,
        user: userWithoutPassword,
      };

      res
        .status(HTTP_STATUS.CREATED)
        .json(
          successResponse(
            response,
            "Usuario creado. Se envió un correo de verificación",
          ),
        );
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse("InternalError", "Error interno del servidor"));
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = LoginSchema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            errorResponse(
              "ValidationError",
              "La validación de la solicitud falló",
              errors,
            ),
          );
        return;
      }

      const { email, password } = result.data;

      const user = await userService.findByEmail(email);
      if (!user) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(errorResponse("Unauthorized", "Credenciales inválidas"));
        return;
      }

      const isValidPassword = await userService.validatePassword(
        user,
        password,
      );
      if (!isValidPassword) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(errorResponse("Unauthorized", "Credenciales inválidas"));
        return;
      }

      if (!user.isEmailVerified) {
        res
          .status(HTTP_STATUS.FORBIDDEN)
          .json(
            errorResponse(
              "Forbidden",
              "Debes verificar tu correo electrónico antes de iniciar sesión",
            ),
          );
        return;
      }

      const accessToken = jwtService.generateToken({
        userId: user.id,
        email: user.email,
      });
      const refreshToken = jwtService.generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      const { passwordHash: _, ...userWithoutPassword } = user;
      const response: AuthResponse = {
        accessToken,
        refreshToken,
        user: userWithoutPassword,
      };

      res.status(HTTP_STATUS.OK).json(successResponse(response));
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse("InternalError", "Error interno del servidor"));
    }
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user as { userId: string; email: string };
      const existingUser = await userService.findById(user.userId);

      if (!existingUser) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(errorResponse("NotFound", "El usuario no fue encontrado"));
        return;
      }

      const { passwordHash: _, ...userWithoutPassword } = existingUser;
      res.status(HTTP_STATUS.OK).json(successResponse(userWithoutPassword));
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse("InternalError", "Error interno del servidor"));
    }
  }

  async logout(_req: AuthRequest, res: Response): Promise<void> {
    try {
      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(null, "Sesión cerrada correctamente"));
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse("InternalError", "Error interno del servidor"));
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            errorResponse(
              "BadRequest",
              "El token de actualización es requerido",
            ),
          );
        return;
      }

      const payload = jwtService.verifyRefreshToken(refreshToken);
      const user = await userService.findById(payload.userId);

      if (!user) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(errorResponse("Unauthorized", "El usuario no fue encontrado"));
        return;
      }

      const newAccessToken = jwtService.generateToken({
        userId: user.id,
        email: user.email,
      });
      const newRefreshToken = jwtService.generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      res.status(HTTP_STATUS.OK).json(
        successResponse({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        }),
      );
    } catch {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(
          errorResponse(
            "Unauthorized",
            "Token de actualización inválido o expirado",
          ),
        );
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            errorResponse(
              "BadRequest",
              "El token de verificación es requerido",
            ),
          );
        return;
      }

      const userId = await userService.verifyEmail(token);

      if (!userId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            errorResponse(
              "BadRequest",
              "Token de verificación inválido o expirado",
            ),
          );
        return;
      }

      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(null, "Email verificado correctamente"));
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse("InternalError", "Error interno del servidor"));
    }
  }

  async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const result = ResendVerificationSchema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            errorResponse(
              "ValidationError",
              "La validación de la solicitud falló",
              errors,
            ),
          );
        return;
      }

      const { email } = result.data;
      const user = await userService.findByEmail(email);

      if (!user) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            successResponse(
              null,
              "Si el email existe, se ha enviado un correo de verificación",
            ),
          );
        return;
      }

      if (user.isEmailVerified) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(errorResponse("BadRequest", "El email ya está verificado"));
        return;
      }

      const token = await userService.setEmailVerificationToken(user.id);

      if (!token) {
        res
          .status(HTTP_STATUS.INTERNAL_ERROR)
          .json(errorResponse("InternalError", "Error al generar el token"));
        return;
      }

      const emailSent = await emailService.sendVerificationEmail(email, token);

      if (!emailSent) {
        res
          .status(HTTP_STATUS.INTERNAL_ERROR)
          .json(
            errorResponse(
              "InternalError",
              "Error al enviar el correo de verificación",
            ),
          );
        return;
      }

      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(null, "Correo de verificación enviado"));
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse("InternalError", "Error interno del servidor"));
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const result = ForgotPasswordSchema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            errorResponse(
              "ValidationError",
              "La validación de la solicitud falló",
              errors,
            ),
          );
        return;
      }

      const { email } = result.data;
      const token = await userService.setPasswordResetToken(email);

      if (token) {
        await emailService.sendPasswordResetEmail(email, token);
      }

      res
        .status(HTTP_STATUS.OK)
        .json(
          successResponse(
            null,
            "Si el email existe, se ha enviado un enlace de recuperación",
          ),
        );
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse("InternalError", "Error interno del servidor"));
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const result = ResetPasswordSchema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            errorResponse(
              "ValidationError",
              "La validación de la solicitud falló",
              errors,
            ),
          );
        return;
      }

      const { token, newPassword } = result.data;
      const success = await userService.resetPassword(token, newPassword);

      if (!success) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            errorResponse(
              "BadRequest",
              "Token de recuperación inválido o expirado",
            ),
          );
        return;
      }

      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(null, "Contraseña restablecida correctamente"));
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse("InternalError", "Error interno del servidor"));
    }
  }
}

export const authController = new AuthController();
