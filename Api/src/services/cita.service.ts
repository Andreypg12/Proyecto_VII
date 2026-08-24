import { prisma } from '../config/prisma';
import { EstadoCita, EstadoUsuario, Modalidad, Rol, } from '../../generated/prisma/enums';
import { CambiarEstadoCitaDto, CreateCitaDto, } from '../dtos/cita.dto';
import { AppError } from '../utils/app-error';

interface FiltrosCita {
    estado?: EstadoCita;
    idProfesional?: number;
    fechaDesde?: string;
    fechaHasta?: string;
}


export const citaService = {

    //Este método devuelve las modalidades y estados disponibles en los enums de Prisma.
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


    async listar(filtros?: FiltrosCita) {

        const where: any = {};

        if (filtros?.estado) { where.estado = filtros.estado; }

        if (filtros?.idProfesional) { where.id_profesional = filtros.idProfesional; }

        //se ejecuta cuando se recibió al menos una de las dos fechas.
        if (filtros?.fechaDesde || filtros?.fechaHasta) {

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
                comentario_profesional: true,
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


    async obtenerPorId(id: number) {

        return prisma.cita.findUnique({
            where: {
                id,
            },

            select: {
                id: true,

                fecha_hora_inicio: true,

                fecha_hora_finalizacion_esperada: true,

                fecha_hora_finalizacion_real: true,

                comentario_cliente: true,
                comentario_profesional: true,
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

        //Convertir la fecha recibida
        const fechaInicio = new Date(data.fecha_hora_inicio);

        //Valida que la fecha sea válida
        if (Number.isNaN(fechaInicio.getTime())) {
            throw AppError.badRequest(
                "La fecha y hora de inicio no son válidas"
            );
        }

        //Validar que la cita sea futura
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

        fechaFinalizacionEsperada.setMinutes(fechaFinalizacionEsperada.getMinutes() + servicio.duracion_estimada);

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
    },


    async cambiarEstado(id: number, data: CambiarEstadoCitaDto, realizadoPor: string = "SISTEMA", usuarioId?: number) {


        //Busca la cita por su id, solo trae id, estado y fecha hora finalización esperada.
        const cita =
            await prisma.cita.findUnique({
                where: {
                    id,
                },

                select: {
                    id: true,
                    estado: true,

                    fecha_hora_finalizacion_esperada:
                        true,
                    id_cliente: true,
                    id_profesional: true,
                    id_servicio: true,
                },
            });

        if (!cita) {
            throw AppError.badRequest(
                'La cita seleccionada no existe'
            );
        }

        //Verificar cuales serán los cambios que si están permitidos
        let cambioPermitido = false;

        switch (cita.estado) {

            case EstadoCita.PENDIENTE:

                if (
                    data.estado === EstadoCita.ACEPTADA ||
                    data.estado === EstadoCita.RECHAZADA
                ) {
                    cambioPermitido = true;
                }

                break;


            case EstadoCita.ACEPTADA:

                if (
                    data.estado === EstadoCita.COMPLETADA ||
                    data.estado === EstadoCita.CANCELADA
                ) {
                    cambioPermitido = true;
                }

                break;


            default:
                cambioPermitido = false;
                break;
        }

        if (!cambioPermitido) {
            throw AppError.badRequest(
                `No es posible cambiar una cita ` +
                `de ${cita.estado} a ${data.estado}`
            );
        }


        //En caso de que la fecha actual aún sea menor que la fecha esperada
        if (data.estado === EstadoCita.COMPLETADA && new Date() < cita.fecha_hora_finalizacion_esperada) {
            throw AppError.badRequest(
                'La cita todavía no puede marcarse como completada'
            );
        }

        //Preparar el comentario, darle "formato"
        const comentarioProfesional = data.comentario_profesional?.trim() || null;

        if (data.estado === EstadoCita.RECHAZADA && !comentarioProfesional) {
            throw AppError.badRequest(
                'Debe indicar el motivo por el que se rechaza la cita'
            );
        }

        if (data.estado === EstadoCita.CANCELADA && !comentarioProfesional) {
            throw AppError.badRequest(
                'Debe indicar el motivo por el que se cancela la cita'
            );
        }

        return await prisma.$transaction(async (tx) => {
            const citaActualizada = await tx.cita.update({
                where: {
                    id,
                },

                data: {
                    estado: data.estado,
                    comentario_profesional: comentarioProfesional,
                    fecha_hora_finalizacion_real: data.estado === EstadoCita.COMPLETADA ? new Date() : null,
                },

                //devolvemos id, estado, comentario profesional, hora finalización real
                select: {
                    id: true,
                    estado: true,

                    comentario_profesional:
                        true,

                    fecha_hora_finalizacion_real:
                        true,

                    updateAt: true,
                },
            });

            await tx.historialCita.create({
                data: {
                    id_cita: cita.id,
                    estado_anterior: cita.estado,
                    estado_nuevo: data.estado,
                    comentario: comentarioProfesional,
                    realizado_por: realizadoPor,
                    id_usuario: usuarioId ?? undefined,
                    id_cliente: cita.id_cliente,
                    id_profesional: cita.id_profesional,
                    id_servicio: cita.id_servicio,
                }
            });

            return citaActualizada;
        });
    },
}