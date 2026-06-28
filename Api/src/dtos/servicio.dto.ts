import { z } from "zod";
import { Modalidad } from "../../generated/prisma/enums";

export const createServicioSchema = z.object({
    servicio: z
        .string()
        .trim()
        .min(3, "El nombre del servicio debe tener al menos 3 caracteres")
        .max(100, "El nombre del servicio no puede superar 100 caracteres"),

    descripcion: z
        .string()
        .trim()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .max(500, "La descripción no puede superar 500 caracteres"),

    precio: z
        .number({
            message: "El precio debe ser numérico",
        })
        .positive("El precio debe ser mayor a 0"),

    duracion_estimada: z
        .number({
            message: "La duración estimada debe ser un número",
        })
        .int("La duración estimada debe ser un número entero")
        .positive("La duración estimada debe ser mayor a 0")
        .min(1, "La duración estimada debe ser al menos 1 minuto")
        .max(32767, "La duración estimada no puede superar los 32767 minutos"),

    modalidad: z.enum(["PRESENCIAL", "VIRTUAL", "HÍBRIDA"]),

    profesional_id: z
        .number()
        .int()
        .positive("El profesional es obligatorio"),

    categoria_id: z
        .number()
        .int()
        .positive("La categoría es obligatoria"),

    especialidades_Ids: z
        .array(
            z
                .number()
                .int()
                .positive())
        .optional(),
});

export const updateServicioSchema = createServicioSchema.partial();

export type CreateServicioDto = z.infer<typeof createServicioSchema>;
export type UpdateServicioDto = z.infer<typeof updateServicioSchema>;