import { prisma } from '../config/prisma';
import { CreateRoleInput } from '../schemas/role.schema';
import { RoleName, Prisma } from '@prisma/client';

class RoleService {
  async findAll() {
    try {
      return await prisma.role.findMany();
    } catch {
      return [];
    }
  }

  async findById(id: string) {
    try {
      return await prisma.role.findUnique({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return null;
      }
      return null;
    }
  }

  async findByName(name: string) {
    try {
      return await prisma.role.findUnique({
        where: { name: name as RoleName },
      });
    } catch {
      return null;
    }
  }

  async create(data: CreateRoleInput) {
    try {
      return await prisma.role.create({
        data: {
          name: data.name as RoleName,
          displayName: data.displayName,
          description: data.description,
        },
      });
    } catch {
      return null;
    }
  }

  async update(id: string, data: { name?: string; displayName?: string; description?: string }) {
    try {
      return await prisma.role.update({
        where: { id },
        data: {
          name: data.name as RoleName,
          displayName: data.displayName,
          description: data.description,
        },
      });
    } catch {
      return null;
    }
  }

  async delete(id: string) {
    try {
      return await prisma.role.delete({ where: { id } });
    } catch {
      return null;
    }
  }
}

export const roleService = new RoleService();
