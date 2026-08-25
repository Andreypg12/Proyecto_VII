import { prisma } from '../config/prisma';
import { EstadoCita, Rol } from '../../generated/prisma/enums';
import { CreateValoracionDTO } from '../dtos/valoracion.dto';
import { AppError } from '../utils/app-error';

export const valoracionService = {

    async crear(data: CreateValoracionDTO, usuarioId: number) {

        // Verificar que la cita existe
        const cita = await prisma.cita.findUnique({
            where: { id: data.id_cita },
            select: {
                id: true,
                estado: true,
                id_cliente: true,
                id_profesional: true,
            },
        });

        if (!cita) {
            throw AppError.badRequest('La cita seleccionada no existe');
        }

        // Solo se puede valorar una cita completada
        if (cita.estado !== EstadoCita.COMPLETADA) {
            throw AppError.badRequest(
                'Solo se pueden valorar citas que estén en estado Completada'
            );
        }

        // Verificar que el usuario autenticado es el cliente de la cita
        if (cita.id_cliente !== usuarioId) {
            throw AppError.badRequest(
                'Solo el cliente de la cita puede dejar una valoración'
            );
        }

        // Verificar que no exista ya una valoración para esta cita
        const existente = await prisma.valoracion.findFirst({
            where: { id_cita: data.id_cita },
        });

        if (existente) {
            throw AppError.badRequest(
                'Ya existe una valoración para esta cita'
            );
        }

        // Verificar que el profesional coincida
        if (cita.id_profesional !== data.id_profesional) {
            throw AppError.badRequest(
                'El profesional indicado no coincide con el de la cita'
            );
        }

        // Crear la valoración
        return prisma.valoracion.create({
            data: {
                puntuacion: data.puntuacion,
                comentario: data.comentario,
                id_profesional: data.id_profesional,
                id_cliente: data.id_cliente,
                id_cita: data.id_cita,
            },
            include: {
                cliente: {
                    select: { id: true, nombre: true, apellidos: true },
                },
            },
        });
    },

    async obtenerPorCita(idCita: number) {
        return prisma.valoracion.findFirst({
            where: { id_cita: idCita },
            include: {
                cliente: {
                    select: { id: true, nombre: true, apellidos: true },
                },
            },
        });
    },
};
