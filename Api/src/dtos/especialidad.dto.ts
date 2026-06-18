import { z } from "zod";

export const createEspecialidadSchema = z.object({
    especialidad: z
        .string()
        .trim()
        .min(3, "El nombre de la especialidad debe contener al menos 3 caracteres.")
        .max(100, "El nombre no puede superar 100 caracteres"),
    descripcion: z
        .string()
        .trim()
        .min(3, "La descripción de la especialidad debe contener al menos 3 caracteres.")
        .max(100, "La descripción no puede superar 200 caracteres"),
    estado: z.boolean(),

    perfiles_profesionales: z
        .array(z.number())
        .optional(),
    
    servicios: z
        .array(z.number())
        .optional(),
});

export const updateEspecialidadSchema = createEspecialidadSchema.partial();
export type CreateEspecialidadDto = z.infer<typeof createEspecialidadSchema>;
export type UpdateEspecialidadDto = z.infer<typeof updateEspecialidadSchema>;