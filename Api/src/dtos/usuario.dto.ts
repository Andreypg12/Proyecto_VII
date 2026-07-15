import { email, z } from "zod";

export const createUsuarioSchema = z.object ({

    email: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, "El email debe tener al menos 3 caracteres")
        .max(150, "El email no puede superar los 150 caracteres"),

    nombre: z
        .string()
        .trim()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede superar los 100 caracteres"),
    
    apellidos: z
        .string()
        .trim()
        .min(3, "Los apellidos deben tener al menos 3 caracteres")
        .max(120, "Los apellidos no pueden superar los 120 caracteres"),

    password: z
        .string()
        .trim()
        .min(3, "La contraseña debe tener al menos 3 caracteres")
        .max(251, "La contraseña no puede superar los 251 caracteres"),

    rol: z
        .enum(["ADMINISTRADOR", "PROFESIONAL", "CLIENTE"])
        .optional(),

    estado: z
        .enum(["ACTIVO", "BLOQUEADO"])
        .optional(),
});

export const updateUsuarioSchema = createUsuarioSchema.partial();
export type CreateUsuarioDto = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioDto = z.infer<typeof updateUsuarioSchema>;