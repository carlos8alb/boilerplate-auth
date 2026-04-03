import { z } from "zod";

const ROLE_VALUES = ["ADMIN", "USER", "MODERATOR", "GUEST", "CLIENT", "COMPANY"];

export const CreateRoleSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del rol es requerido")
    .max(50, "El nombre del rol no puede exceder 50 caracteres")
    .refine(
      (val) => ROLE_VALUES.includes(val),
      {
        message: `El nombre del rol debe ser uno de: ${ROLE_VALUES.join(", ")}`,
      },
    ),
  displayName: z
    .string()
    .min(1, "El nombre para mostrar es requerido")
    .max(50, "El nombre para mostrar no puede exceder 50 caracteres"),
  description: z
    .string()
    .max(255, "La descripción no puede exceder 255 caracteres")
    .optional(),
});

export const UpdateRoleSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre del rol es requerido")
      .max(50, "El nombre del rol no puede exceder 50 caracteres")
      .refine(
        (val) => !val || ROLE_VALUES.includes(val),
        {
          message: `El nombre del rol debe ser uno de: ${ROLE_VALUES.join(", ")}`,
        },
      )
      .optional(),
    displayName: z
      .string()
      .min(1, "El nombre para mostrar es requerido")
      .max(50, "El nombre para mostrar no puede exceder 50 caracteres")
      .optional(),
    description: z
      .string()
      .max(255, "La descripción no puede exceder 255 caracteres")
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.displayName !== undefined || data.description !== undefined, {
    message: "Debe enviar al menos un campo a actualizar",
  });

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
