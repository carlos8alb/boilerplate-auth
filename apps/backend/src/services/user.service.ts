import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { RoleName } from "@prisma/client";

class UserService {
  async findByEmail(email: string) {
    try {
      const user = await prisma.user.findFirst({
        where: { email, deletedAt: null },
        include: { role: true },
      });
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.lastName || undefined,
        roleId: user.roleId,
        role: user.role,
        passwordHash: user.passwordHash,
        isEmailVerified: user.isEmailVerified,
      };
    } catch {
      return null;
    }
  }

  async findById(id: string) {
    try {
      const user = await prisma.user.findFirst({
        where: { id, deletedAt: null },
        include: { role: true },
      });
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.lastName || undefined,
        roleId: user.roleId,
        role: user.role,
        passwordHash: user.passwordHash,
        isEmailVerified: user.isEmailVerified,
      };
    } catch {
      return null;
    }
  }

  async create(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        if (existingUser.deletedAt) {
          const hashedPassword = await bcrypt.hash(password, 10);
          const defaultRole = await prisma.role.findUnique({
            where: { name: RoleName.USER },
          });

          const user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              passwordHash: hashedPassword,
              firstName,
              lastName,
              roleId: defaultRole?.id || "",
              deletedAt: null,
            },
            include: { role: true },
          });

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName:
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName || user.lastName || undefined,
            roleId: user.roleId,
            role: user.role,
            passwordHash: user.passwordHash,
            isEmailVerified: user.isEmailVerified,
          };
        }
        return null;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const defaultRole = await prisma.role.findUnique({
        where: { name: RoleName.USER },
      });

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          roleId: defaultRole?.id || "",
        },
        include: { role: true },
      });

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.lastName || undefined,
        roleId: user.roleId,
        role: user.role,
        passwordHash: user.passwordHash,
        isEmailVerified: user.isEmailVerified,
      };
    } catch {
      return null;
    }
  }

  async validatePassword(user: { passwordHash: string }, password: string) {
    return bcrypt.compare(password, user.passwordHash);
  }

  async updatePassword(userId: string, newPassword: string) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
      });
      return true;
    } catch {
      return false;
    }
  }

  async setEmailVerificationToken(userId: string) {
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerificationToken: token,
          emailVerificationExpiry: expiry,
        },
      });

      return token;
    } catch {
      return null;
    }
  }

  async verifyEmail(token: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationExpiry: { gt: new Date() },
          deletedAt: null,
        },
      });

      if (!user) return null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null,
        },
      });

      return user.id;
    } catch {
      return null;
    }
  }

  async setPasswordResetToken(email: string) {
    try {
      const user = await prisma.user.findFirst({
        where: { email, deletedAt: null },
      });
      if (!user) return null;

      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: token,
          passwordResetExpiry: expiry,
        },
      });

      return token;
    } catch {
      return null;
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpiry: { gt: new Date() },
          deletedAt: null,
        },
      });

      if (!user) return false;

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiry: null,
        },
      });

      return true;
    } catch {
      return false;
    }
  }

  async findAll() {
    try {
      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        include: { role: true },
      });
      return users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.lastName || undefined,
        roleId: user.roleId,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
    } catch {
      return [];
    }
  }

  async delete(userId: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }

  async update(
    userId: string,
    data: { firstName?: string; lastName?: string; roleId?: string },
  ) {
    try {
      const updateData: {
        firstName?: string;
        lastName?: string;
        roleId?: string;
      } = {};

      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.roleId !== undefined) updateData.roleId = data.roleId;

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: { role: true },
      });

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.lastName || undefined,
        roleId: user.roleId,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch {
      return null;
    }
  }
}

export const userService = new UserService();
