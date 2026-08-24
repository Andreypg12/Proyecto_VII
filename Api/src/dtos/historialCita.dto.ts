import { z } from "zod";

export const getHistorialByCitaSchema = z.object({
    idCita: z.coerce.number().int().positive("El ID de la cita debe ser un número entero positivo"),
});

export type GetHistorialByCitaDto = z.infer<typeof getHistorialByCitaSchema>;
