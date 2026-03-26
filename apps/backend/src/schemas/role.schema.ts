import { z } from "zod";

const VALID_ROLE_NAMES = "ADMIN, USER, MODERATOR, GUEST, CLIENT";

export const CreateRoleSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del rol es requerido")
    .max(50, "El nombre del rol no puede exceder 50 caracteres")
    .refine(
      (val: string) =>
        ["ADMIN", "USER", "MODERATOR", "GUEST", "CLIENT"].includes(val),
      {
        message: `El nombre del rol debe ser uno de: ${VALID_ROLE_NAMES}`,
      },
    ),
  description: z
    .string()
    .max(255, "La descripción no puede exceder 255 caracteres")
    .optional(),
});

export const UpdateRoleSchema = z
  .object({
    description: z
      .string()
      .min(1, "La descripción no puede estar vacía")
      .max(255, "La descripción no puede exceder 255 caracteres")
      .optional(),
  })
  .refine((data) => data.description !== undefined, {
    message: "Debe enviar la descripción a actualizar",
  });

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
