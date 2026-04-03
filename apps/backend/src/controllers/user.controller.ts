import { Response } from 'express';
import { userService } from '../services/user.service';
import { HTTP_STATUS } from '../types/error.types';
import { successResponse, errorResponse } from '../types/api-response.types';
import { AuthRequest } from '../middlewares/auth.middleware';
import { RoleName } from '@prisma/client';
import { UpdateUserSchema } from '../schemas/user.schema';

class UserController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const requestingUser = req.user as { userId: string; email: string };
      const user = await userService.findById(requestingUser.userId);

      if (!user || user.role?.name !== RoleName.ADMIN) {
        res
          .status(HTTP_STATUS.FORBIDDEN)
          .json(
            errorResponse('Forbidden', 'Se requiere acceso de administrador'),
          );
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const pageSizeParam = req.query.pageSize as string;
      const pageSize = pageSizeParam 
        ? Math.min(100, Math.max(1, parseInt(pageSizeParam)))
        : 10;
      const search = (req.query.search as string) || undefined;
      const role = (req.query.role as string) || undefined;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = ((req.query.sortOrder as string) || 'desc') as 'asc' | 'desc';

      const result = await userService.findAllWithPagination(page, pageSize, search, role, sortBy, sortOrder);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          pages: result.pages,
        },
        timestamp: new Date().toISOString(),
      });
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse('InternalError', 'Error interno del servidor'));
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = UpdateUserSchema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            errorResponse(
              'ValidationError',
              'La validación de la solicitud falló',
              errors,
            ),
          );
        return;
      }

      const requestingUser = req.user as { userId: string; email: string };
      const currentUser = await userService.findById(requestingUser.userId);

      if (!currentUser) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(errorResponse('Unauthorized', 'Usuario no autorizado'));
        return;
      }

      const userIdToUpdate = req.params.id;
      const body = result.data;

      const canUpdate =
        currentUser.role?.name === RoleName.ADMIN ||
        currentUser.id === userIdToUpdate;

      if (!canUpdate) {
        res
          .status(HTTP_STATUS.FORBIDDEN)
          .json(
            errorResponse(
              'Forbidden',
              'No tienes permiso para actualizar este usuario',
            ),
          );
        return;
      }

      const updatedUser = await userService.update(userIdToUpdate, body);

      if (!updatedUser) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(errorResponse('NotFound', 'El usuario no fue encontrado'));
        return;
      }

      res
        .status(HTTP_STATUS.OK)
        .json(
          successResponse(updatedUser, 'Usuario actualizado correctamente'),
        );
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse('InternalError', 'Error interno del servidor'));
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const requestingUser = req.user as { userId: string; email: string };
      const user = await userService.findById(requestingUser.userId);

      if (!user || user.role?.name !== RoleName.ADMIN) {
        res
          .status(HTTP_STATUS.FORBIDDEN)
          .json(
            errorResponse('Forbidden', 'Se requiere acceso de administrador'),
          );
        return;
      }

      const userIdToDelete = req.params.id;

      if (!userIdToDelete) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(errorResponse('BadRequest', 'ID de usuario inválido'));
        return;
      }

      const userToDelete = await userService.findById(userIdToDelete);
      if (!userToDelete) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(errorResponse('NotFound', 'El usuario no fue encontrado'));
        return;
      }

      const deleted = await userService.delete(userIdToDelete);

      if (!deleted) {
        res
          .status(HTTP_STATUS.INTERNAL_ERROR)
          .json(errorResponse('InternalError', 'Error al eliminar el usuario'));
        return;
      }

      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(null, 'Usuario eliminado correctamente'));
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse('InternalError', 'Error interno del servidor'));
    }
  }
}

export const userController = new UserController();
