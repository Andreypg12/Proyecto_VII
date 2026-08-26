import { z } from "zod";

export const createValoracionSchema = z.object({
    puntuacion: z
        .number({ message: "La puntuación debe ser un número" })
        .int("La puntuación debe ser un número entero")
        .min(1, "La puntuación mínima es 1")
        .max(5, "La puntuación máxima es 5"),

    comentario: z
        .string({ message: "El comentario debe ser un texto" })
        .min(1, "El comentario no puede estar vacío")
        .max(500, "El comentario no puede exceder 500 caracteres"),

    id_profesional: z
        .number({ message: "El id del profesional debe ser numérico" })
        .int()
        .positive("El id del profesional debe ser mayor a 0"),

    id_cliente: z
        .number({ message: "El id del cliente debe ser numérico" })
        .int()
        .positive("El id del cliente debe ser mayor a 0"),

    id_cita: z
        .number({ message: "El id de la cita debe ser numérico" })
        .int()
        .positive("El id de la cita debe ser mayor a 0"),
});

export type CreateValoracionDTO = z.infer<typeof createValoracionSchema>;
