import { z } from "zod";
import { Modalidad } from "../../generated/prisma/enums";

export const createProfesionalSchema = z.object({
    usuario: z.object({
        email: z
            .string()
            .trim()
            .toLowerCase()
            .email("El formato del email no es válido")
            .min(3, "El email debe tener al menos 3 caracteres")
            .max(150, "El email no puede superar los 150 caracteres")
            // Validación: no permitir caracteres especiales peligrosos
            .refine(
                (email) => !/[\s<>()\[\]\\]/.test(email),
                { message: "El email contiene caracteres no permitidos" }
            ),
        nombre: z
            .string()
            .trim()
            .min(3, "El nombre debe tener al menos 3 caracteres")
            .max(100, "El nombre no puede superar 100 caracteres"),
        apellidos: z
            .string()
            .trim()
            .min(3, "Los apellidos deben tener al menos 3 caracteres")
            .max(120, "Los apellidos no pueden superar los 120 caracteres"),
        password: z
            .string()
            .trim()
            .min(3, "La contraseña deben tener al menos 3 caracteres")
            .max(251, "La contraseña no pueden superar los 251 caracteres"),
    }),
    titulo: z
        .string()
        .trim()
        .min(3, "El título deben tener al menos 3 caracteres")
        .max(100, "El título no pueden superar los 100 caracteres"),
    descripcion: z
        .string()
        .trim()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .max(500, "La descripción no puede superar 500 caracteres"),
    tarifa_por_hora: z
        .number({
            message: "La tarifa por hora debe ser numérico",
        })
        .positive("La tarifa por hora debe ser mayor a 0"),
    annos_experiencia: z
        .number({
            message: "Los años de experiencia debe ser numérico",
        }),
    imagen_profesional: z
        .string()
        .trim()
        .max(255)
        .optional(),
    disponibilidad: z
        .boolean(),
    modalidad: z.enum(["PRESENCIAL", "VIRTUAL", "HÍBRIDA"]),
    /* telefono: z
        .string()
        .trim()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede superar 100 caracteres"), */ //falta
    ubicacion: z
        .object({
            descripcion: z
                .string()
                .trim()
                .min(3, "La descripcion deben tener al menos 3 caracteres")
                .max(500, "La descripcion no pueden superar los 500 caracteres"),
            id_ubicacion: z.number()
        })
});

export const updateProfesionalSchema = createProfesionalSchema.partial();

export type CreateProfesionalDto = z.infer<typeof createProfesionalSchema>;
export type UpdateProfesionalDto = z.infer<typeof updateProfesionalSchema>;