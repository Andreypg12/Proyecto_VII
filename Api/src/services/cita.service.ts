import { prisma } from '../config/prisma';
import { EstadoCita, EstadoUsuario, Modalidad, Rol, } from '../../generated/prisma/enums';
import { CreateCitaDto } from '../dtos/cita.dto';
import { AppError } from '../utils/app-error';

interface FiltrosCita {
    estado?: EstadoCita;
    idProfesional?: number;
    fechaDesde?: string;
    fechaHasta?: string;
}


export const citaService = {
    async obtenerConfiguracion() {

        return {
            modalidades: Object.values(
                Modalidad
            ),

            estados: Object.values(
                EstadoCita
            ),
        };
    },


    async listar(
        filtros?: FiltrosCita
    ) {

        const where: any = {};

        if (filtros?.estado) {
            where.estado =
                filtros.estado;
        }

        if (filtros?.idProfesional) {
            where.id_profesional =
                filtros.idProfesional;
        }

        if (
            filtros?.fechaDesde ||
            filtros?.fechaHasta
        ) {

            where.fecha_hora_inicio = {};

            if (filtros.fechaDesde) {
                where.fecha_hora_inicio.gte =
                    new Date(
                        `${filtros.fechaDesde}T00:00:00`
                    );
            }

            if (filtros.fechaHasta) {
                where.fecha_hora_inicio.lte =
                    new Date(
                        `${filtros.fechaHasta}T23:59:59.999`
                    );
            }
        }

        return prisma.cita.findMany({
            where,

            select: {
                id: true,

                fecha_hora_inicio: true,

                fecha_hora_finalizacion_esperada:
                    true,

                fecha_hora_finalizacion_real:
                    true,

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

                        duracion_estimada:
                            true,

                        modalidad: true,
                    },
                },
            },

            orderBy: {
                fecha_hora_inicio:
                    'desc',
            },
        });
    },


    async obtenerPorId(
        id: number
    ) {

        return prisma.cita.findUnique({
            where: {
                id,
            },

            select: {
                id: true,

                fecha_hora_inicio: true,

                fecha_hora_finalizacion_esperada:
                    true,

                fecha_hora_finalizacion_real:
                    true,

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

                        tarifa_por_hora:
                            true,

                        disponibilidad:
                            true,

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

                        duracion_estimada:
                            true,

                        modalidad: true,
                        estado: true,
                    },
                },
            },
        });
    },


    async crear(data: CreateCitaDto) {

        const fechaInicio = new Date(data.fecha_hora_inicio);

        if (Number.isNaN(fechaInicio.getTime())) {
            throw AppError.badRequest(
                "La fecha y hora de inicio no son válidas"
            );
        }

        if (fechaInicio <= new Date()) {
            throw AppError.badRequest(
                "La fecha y hora deben ser posteriores a la fecha actual"
            );
        }

        const cliente = await prisma.usuario.findFirst({
            where: {
                id: data.id_cliente,
                rol: Rol.CLIENTE,
                estado: EstadoUsuario.ACTIVO,
            },
        });

        if (!cliente) {
            throw AppError.badRequest(
                "El cliente seleccionado no existe o no está activo"
            );
        }

        const profesional = await prisma.perfilProfesional.findFirst({
            where: {
                id: data.id_profesional,
                disponibilidad: true,
                usuario: {
                    rol: Rol.PROFESIONAL,
                    estado: EstadoUsuario.ACTIVO,
                },
            },
        });

        if (!profesional) {
            throw AppError.badRequest(
                "El profesional no existe o no está disponible"
            );
        }

        const servicio = await prisma.servicio.findFirst({
            where: {
                id: data.id_servicio,
                id_profesional: data.id_profesional,
                estado: true,
            },
        });

        if (!servicio) {
            throw AppError.badRequest(
                "El servicio no existe o no pertenece al profesional"
            );
        }

        if (
            servicio.modalidad !== Modalidad.HÍBRIDA &&
            servicio.modalidad !== data.modalidad
        ) {
            throw AppError.badRequest(
                `El servicio solamente se ofrece en modalidad ${servicio.modalidad}`
            );
        }

        const fechaFinalizacionEsperada = new Date(fechaInicio);

        fechaFinalizacionEsperada.setMinutes(
            fechaFinalizacionEsperada.getMinutes() +
            servicio.duracion_estimada
        );

        return prisma.cita.create({
            data: {
                fecha_hora_inicio: fechaInicio,
                fecha_hora_finalizacion_esperada:
                    fechaFinalizacionEsperada,

                comentario_cliente:
                    data.comentario_cliente,

                monto_estimado:
                    servicio.precio,

                modalidad:
                    data.modalidad,

                id_cliente:
                    data.id_cliente,

                id_profesional:
                    data.id_profesional,

                id_servicio:
                    data.id_servicio,
            },
        });
    }
}