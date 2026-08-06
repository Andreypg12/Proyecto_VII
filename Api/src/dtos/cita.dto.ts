import { z } from "zod";
import { EstadoCita, Modalidad } from "../../generated/prisma/enums";

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



export const cambiarEstadoCitaSchema = z
    .object({

        estado: z.enum(
            [
                EstadoCita.ACEPTADA,
                EstadoCita.RECHAZADA,
                EstadoCita.CANCELADA,
                EstadoCita.COMPLETADA,
            ],
            {
                message:
                    "El nuevo estado de la cita no es válido",
            }
        ),

        comentario_profesional: z
            .string()
            .trim()
            .max(
                500,
                "El comentario profesional no puede superar los 500 caracteres"
            )
            .optional()
            .nullable(),

    })
    .superRefine(
        (
            data,
            context
        ) => {

            const requiereComentario =
                data.estado ===
                    EstadoCita.RECHAZADA ||
                data.estado ===
                    EstadoCita.CANCELADA;

            if (
                requiereComentario &&
                !data.comentario_profesional
                    ?.trim()
            ) {
                context.addIssue({
                    code:
                        z.ZodIssueCode.custom,

                    path: [
                        "comentario_profesional",
                    ],

                    message:
                        data.estado ===
                        EstadoCita.RECHAZADA
                            ? "Debe indicar el motivo por el que se rechaza la cita"
                            : "Debe indicar el motivo por el que se cancela la cita",
                });
            }
        }
    );




export type CreateCitaDto = z.infer<typeof createCitaSchema>;
export type UpdateCitaDto = z.infer<typeof updateCitaSchema>;
export type CambiarEstadoCitaDto = z.infer<typeof cambiarEstadoCitaSchema>;