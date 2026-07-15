import { z } from "zod";
import { Modalidad } from "../../generated/prisma/enums";

export const createCitaSchema = z.object({

    id_cliente: z
        .number()
        .int("El cliente debe ser válido")
        .positive("Debe seleccionar un cliente"),

    id_profesional: z
        .number()
        .int("El profesional debe ser válido")
        .positive("Debe seleccionar un profesional"),

    id_servicio: z
        .number()
        .int("El servicio debe ser válido")
        .positive("Debe seleccionar un servicio"),

    fecha_hora_inicio: z
        .string()
        .min(1, "La fecha y hora son obligatorias"),

    modalidad: z.enum(Modalidad, {
        message: "La modalidad seleccionada no es válida",
    }),

    comentario_cliente: z
        .string()
        .trim()
        .max(500, "El comentario no puede superar los 500 caracteres")
        .optional()
        .nullable(),

});

export const updateCitaSchema = createCitaSchema.partial();

export type CreateCitaDto = z.infer<typeof createCitaSchema>;
export type UpdateCitaDto = z.infer<typeof updateCitaSchema>;