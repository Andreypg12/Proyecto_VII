import { prisma } from "../config/prisma";

import {
    EstadoCita,
    EstadoUsuario,
    Modalidad,
    Rol,
} from "../../generated/prisma/enums";

import {
    CreateCitaDto,
    UpdateCitaDto,
} from "../dtos/cita.dto";

import { AppError } from "../utils/app-error";

interface FiltrosCita {
    estado?: EstadoCita;
    idProfesional?: number;
    fechaDesde?: string;
    fechaHasta?: string;
}

export const citaService = {

    /**
     * Lista las citas y permite combinar los filtros:
     * estado, profesional y rango de fechas.
     */
    async listar(filtros?: FiltrosCita) {

        const where: any = {};

        if (filtros?.estado) {
            where.estado = filtros.estado;
        }

        if (filtros?.idProfesional) {
            where.id_profesional = filtros.idProfesional;
        }

        if (filtros?.fechaDesde || filtros?.fechaHasta) {

            where.fecha_hora_inicio = {};

            if (filtros.fechaDesde) {
                where.fecha_hora_inicio.gte = new Date(
                    `${filtros.fechaDesde}T00:00:00`
                );
            }

            if (filtros.fechaHasta) {
                where.fecha_hora_inicio.lte = new Date(
                    `${filtros.fechaHasta}T23:59:59.999`
                );
            }
        }

        return await prisma.cita.findMany({
            where,

            select: {
                id: true,
                fecha_hora_inicio: true,
                fecha_hora_finalizacion_esperada: true,
                fecha_hora_finalizacion_real: true,
                comentario_cliente: true,
                monto_estimado: true,
                modalidad: true,
                estado: true,
                createdAt: true,
                updateAt: true,

                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                        email: true,
                    },
                },

                profesional: {
                    select: {
                        id: true,
                        titulo: true,
                        disponibilidad: true,

                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                apellidos: true,
                                email: true,
                            },
                        },
                    },
                },

                servicio: {
                    select: {
                        id: true,
                        servicio: true,
                        descripcion: true,
                        precio: true,
                        duracion_estimada: true,
                        modalidad: true,
                    },
                },
            },

            orderBy: {
                fecha_hora_inicio: "desc",
            },
        });
    },

    /**
     * Obtiene la información completa de una cita.
     */
    async obtenerPorId(id: number) {

        return await prisma.cita.findUnique({
            where: {
                id,
            },

            select: {
                id: true,
                fecha_hora_inicio: true,
                fecha_hora_finalizacion_esperada: true,
                fecha_hora_finalizacion_real: true,
                comentario_cliente: true,
                monto_estimado: true,
                modalidad: true,
                estado: true,
                createdAt: true,
                updateAt: true,

                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                        email: true,
                    },
                },

                profesional: {
                    select: {
                        id: true,
                        titulo: true,
                        descripcion: true,
                        tarifa_por_hora: true,
                        disponibilidad: true,
                        telefono: true,

                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                apellidos: true,
                                email: true,
                                estado: true,
                            },
                        },
                    },
                },

                servicio: {
                    select: {
                        id: true,
                        servicio: true,
                        descripcion: true,
                        precio: true,
                        duracion_estimada: true,
                        modalidad: true,
                        estado: true,
                    },
                },
            },
        });
    },

    /**
     * Registra una nueva cita.
     */
    async crear(data: CreateCitaDto) {

        const fechaInicio = new Date(data.fecha_hora_inicio);

        if (Number.isNaN(fechaInicio.getTime())) {
            throw AppError.badRequest(
                "La fecha y hora de inicio no son válidas"
            );
        }

        if (fechaInicio <= new Date()) {
            throw AppError.badRequest(
                "La fecha y hora de la cita deben ser posteriores a la fecha actual"
            );
        }

        // Validar que el cliente exista, esté activo
        // y realmente tenga el rol CLIENTE.
        const cliente = await prisma.usuario.findFirst({
            where: {
                id: data.id_cliente,
                rol: Rol.CLIENTE,
                estado: EstadoUsuario.ACTIVO,
            },
        });

        if (!cliente) {
            throw AppError.badRequest(
                "El cliente seleccionado no existe o no se encuentra activo"
            );
        }

        // Validar que el profesional exista,
        // esté disponible y tenga un usuario activo.
        const profesional =
            await prisma.perfilProfesional.findFirst({
                where: {
                    id: data.id_profesional,
                    disponibilidad: true,

                    usuario: {
                        estado: EstadoUsuario.ACTIVO,
                        rol: Rol.PROFESIONAL,
                    },
                },
            });

        if (!profesional) {
            throw AppError.badRequest(
                "El profesional seleccionado no existe o no se encuentra disponible"
            );
        }

        // Validar que el servicio exista y esté activo.
        const servicio = await prisma.servicio.findFirst({
            where: {
                id: data.id_servicio,
                estado: true,
            },
        });

        if (!servicio) {
            throw AppError.badRequest(
                "El servicio seleccionado no existe o está desactivado"
            );
        }

        // Validar que el servicio pertenezca al profesional.
        if (
            servicio.id_profesional !==
            data.id_profesional
        ) {
            throw AppError.badRequest(
                "El servicio seleccionado no pertenece al profesional indicado"
            );
        }

        /*
         * Si el servicio no es híbrido, la modalidad de la cita
         * debe coincidir con la modalidad configurada en el servicio.
         */
        if (
            servicio.modalidad !== Modalidad.HÍBRIDA &&
            servicio.modalidad !== data.modalidad
        ) {
            throw AppError.badRequest(
                `El servicio solamente se ofrece en modalidad ${servicio.modalidad}`
            );
        }

        /*
         * Se calcula la finalización esperada usando
         * la duración del servicio en minutos.
         */
        const fechaFinalizacionEsperada = new Date(
            fechaInicio.getTime() +
            servicio.duracion_estimada * 60 * 1000
        );

        return await prisma.cita.create({
            data: {
                fecha_hora_inicio: fechaInicio,

                fecha_hora_finalizacion_esperada:
                    fechaFinalizacionEsperada,

                fecha_hora_finalizacion_real: null,

                comentario_cliente:
                    data.comentario_cliente?.trim() || null,

                // El monto no viene del formulario.
                // Se toma del precio registrado en el servicio.
                monto_estimado: servicio.precio,

                modalidad: data.modalidad,

                // El estado siempre se asigna desde el backend.
                estado: EstadoCita.PENDIENTE,

                id_cliente: data.id_cliente,
                id_profesional: data.id_profesional,
                id_servicio: data.id_servicio,
            },

            select: {
                id: true,
                fecha_hora_inicio: true,
                fecha_hora_finalizacion_esperada: true,
                fecha_hora_finalizacion_real: true,
                comentario_cliente: true,
                monto_estimado: true,
                modalidad: true,
                estado: true,

                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        apellidos: true,
                        email: true,
                    },
                },

                profesional: {
                    select: {
                        id: true,
                        titulo: true,

                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                apellidos: true,
                                email: true,
                            },
                        },
                    },
                },

                servicio: {
                    select: {
                        id: true,
                        servicio: true,
                        precio: true,
                        duracion_estimada: true,
                        modalidad: true,
                    },
                },
            },
        });
    },
};