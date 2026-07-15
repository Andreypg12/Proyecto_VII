import { email, z } from "zod";
export const createValoracionSchema = z.object ({

    puntuacion: z
        .number({
            message: "La puntuación debe ser un número",
        })
        .int("La puntuación debe ser un número entero")
        .min(1, "La puntuación mínima es 1")
        .max(5, "La puntuación máxima es 5"),

        id_profesional: z
        .number({
            message: "El id del profesional debe ser numérico",
        })
        .int()
        .positive("El id del profesional debe ser mayor a 0"),

    id_cliente: z
        .number({
            message: "El id del cliente debe ser numérico",
        })
        .int()
        .positive("El id del cliente debe ser mayor a 0"),

    id_cita: z
        .number({
            message: "El id de la cita debe ser numérico",
        })
        .int()
        .positive("El id de la cita debe ser mayor a 0"),



});
export const updateValoracionSchema = createValoracionSchema.partial();
export type CreateValoracionDTO = z.infer<typeof createValoracionSchema>;
export type UpdateValoracionDto = z.infer<typeof updateValoracionSchema>;
