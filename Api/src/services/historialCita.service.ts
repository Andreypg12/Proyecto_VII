import { prisma } from "../config/prisma";
import { EstadoCita } from "../../generated/prisma/enums";

export const historialCitaService = {
    async listarPorCita(idCita: number) {
        return await prisma.historialCita.findMany({
            where: { id_cita: idCita },
            orderBy: { fecha_cambio: 'desc' },
            include: {
                cliente: { select: { nombre: true, apellidos: true } },
                profesional: { include: { usuario: { select: { nombre: true, apellidos: true } } } },
                servicio: { select: { servicio: true } },
                usuario: { select: { id: true, email: true, nombre: true, apellidos: true } },
            }
        });
    },

    async crear(data: {
        id_cita: number,
        estado_anterior: EstadoCita,
        estado_nuevo: EstadoCita,
        comentario?: string | null,
        realizado_por: string,
        id_cliente: number,
        id_profesional: number,
        id_servicio: number
    }) {
        return await prisma.historialCita.create({
            data: data
        });
    }
};
