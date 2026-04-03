import { Request, Response } from 'express';
import { roleService } from '../services/role.service';
import { CreateRoleSchema, UpdateRoleSchema } from '../schemas/role.schema';
import { HTTP_STATUS } from '../types/error.types';
import { successResponse, errorResponse } from '../types/api-response.types';

class RoleController {
  async findAll(_req: Request, res: Response): Promise<void> {
    try {
      const roles = await roleService.findAll();
      res.status(HTTP_STATUS.OK).json(successResponse(roles));
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse('InternalError', 'Error interno del servidor'));
    }
  }

  async findById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const role = await roleService.findById(id);

      if (!role) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(errorResponse('NotFound', 'El rol no fue encontrado'));
        return;
      }

      res.status(HTTP_STATUS.OK).json(successResponse(role));
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse('InternalError', 'Error interno del servidor'));
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = CreateRoleSchema.safeParse(req.body);

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

      const { name, displayName, description } = result.data;

      if (!name) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            errorResponse('ValidationError', 'El nombre del rol es requerido'),
          );
        return;
      }

      if (!displayName) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            errorResponse('ValidationError', 'El nombre para mostrar es requerido'),
          );
        return;
      }

      const existingRole = await roleService.findByName(name);
      if (existingRole) {
        res
          .status(HTTP_STATUS.CONFLICT)
          .json(errorResponse('Conflict', 'El rol ya existe'));
        return;
      }

      const role = await roleService.create({ name, displayName, description });

      if (!role) {
        res
          .status(HTTP_STATUS.INTERNAL_ERROR)
          .json(errorResponse('InternalError', 'Error al crear el rol'));
        return;
      }

      res
        .status(HTTP_STATUS.CREATED)
        .json(successResponse(role, 'El rol fue creado correctamente'));
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse('InternalError', 'Error interno del servidor'));
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = UpdateRoleSchema.safeParse(req.body);

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

      const { description } = result.data;

      const role = await roleService.update(id, { description });

      if (!role) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(errorResponse('NotFound', 'El rol no fue encontrado'));
        return;
      }

      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(role, 'El rol fue actualizado correctamente'));
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse('InternalError', 'Error interno del servidor'));
    }
  }

  async delete(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await roleService.delete(id);

      if (!deleted) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(errorResponse('NotFound', 'El rol no fue encontrado'));
        return;
      }

      res
        .status(HTTP_STATUS.OK)
        .json(successResponse(null, 'El rol fue eliminado correctamente'));
    } catch {
      res
        .status(HTTP_STATUS.INTERNAL_ERROR)
        .json(errorResponse('InternalError', 'Error interno del servidor'));
    }
  }
}

export const roleController = new RoleController();
