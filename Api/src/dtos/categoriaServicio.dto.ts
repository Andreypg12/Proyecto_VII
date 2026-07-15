import { z } from "zod";

export const createCategoriaServicioSchema = z.object({
    categoria: z
        .string()
        .trim()
        .min(3, "La categoría debe tener al menos 3 caracteres")
        .max(100, "La categoría no puede superar los 100 caracteres"),

    descripcion: z
        .string()
        .trim()
        .min(3, "La descripción debe tener al menos 3 caracteres")
        .max(200, "La descripción no puede superar los 200 caracteres"),

    estado: z
        .boolean()
        .optional(),
});

export const updateCategoriaServicioSchema = createCategoriaServicioSchema.partial();

export type CreateCategoriaServicioDto = z.infer<typeof createCategoriaServicioSchema>;
export type UpdateCategoriaServicioDto = z.infer<typeof updateCategoriaServicioSchema>;
