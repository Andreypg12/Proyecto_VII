import { prisma } from '../config/prisma';
import { EstadoCita, EstadoUsuario, Modalidad, Rol, } from '../../generated/prisma/enums';
import { CambiarEstadoCitaDto, CreateCitaDto, } from '../dtos/cita.dto';
import { AppError } from '../utils/app-error';

import { AuthTokenPayload } from "../middlewares/auth.middleware";

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

    async obtenerDisponibilidad(idProfesional: number, fecha: string) {

        const inicioDia = new Date(`${fecha}T00:00:00`);
        const finDia = new Date(`${fecha}T23:59:59`);

        const citas = await prisma.cita.findMany({
            where: {
                id_profesional: idProfesional,
                estado: EstadoCita.ACEPTADA,
                fecha_hora_inicio: {
                    gte: inicioDia,
                    lte: finDia,
                },
            },
            select: {
                fecha_hora_inicio: true,
                fecha_hora_finalizacion_esperada: true,
            },
            orderBy: {
                fecha_hora_inicio: 'asc',
            },
        });

        return citas.map(c => ({
            inicio: c.fecha_hora_inicio.toISOString(),
            fin: c.fecha_hora_finalizacion_esperada.toISOString(),
        }));
    },

    

    async listar(
        filtros: FiltrosCita | undefined,
        usuarioAutenticado: AuthTokenPayload
    ) {

        const where: any = {};


        // FILTRO SEGÚN EL ROL

        // CLIENTE:
        // solamente puede ver sus propias citas
        if (
            usuarioAutenticado.rol === Rol.CLIENTE
        ) {

            where.id_cliente =
                usuarioAutenticado.id;

        }


        // PROFESIONAL:
        // solamente puede ver citas asociadas
        // a su propio perfil profesional
        if (
            usuarioAutenticado.rol === Rol.PROFESIONAL
        ) {

            where.profesional = {
                id_usuario:
                    usuarioAutenticado.id
            };

        }


        // ADMINISTRADOR:
        // puede filtrar por cualquier profesional
        if (
            usuarioAutenticado.rol === Rol.ADMINISTRADOR &&
            filtros?.idProfesional
        ) {

            where.id_profesional =
                filtros.idProfesional;

        }


        // FILTRO POR ESTADO

        if (filtros?.estado) {
            where.estado =
                filtros.estado;
        }

        // FILTRO POR FECHAS

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


        // CONSULTA

        return prisma.cita.findMany({ where,

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

                valoracion: {
                    select: {
                        id: true,
                        puntuacion: true,
                        comentario: true,
                        createdAt: true,
                    },
                },

            },


            orderBy: {

                fecha_hora_inicio:
                    'desc',

            },

        });

    },


    async obtenerPorId(id: number, usuarioAutenticado: AuthTokenPayload) {

        const cita = await prisma.cita.findUnique({
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
                id_cliente: true,
                id_profesional: true,

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
                        id_usuario: true,
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

                valoracion: {
                    select: {
                        id: true,
                        puntuacion: true,
                        comentario: true,
                        createdAt: true,
                        cliente: {
                            select: { id: true, nombre: true, apellidos: true },
                        },
                    },
                },
            },
        });

        if (!cita) return null;

        // Autorización
        if (usuarioAutenticado.rol === Rol.CLIENTE && cita.id_cliente !== usuarioAutenticado.id) {
            throw AppError.forbidden('No tiene acceso a esta cita');
        }

        if (usuarioAutenticado.rol === Rol.PROFESIONAL && cita.profesional.id_usuario !== usuarioAutenticado.id) {
            throw AppError.forbidden('No tiene acceso a esta cita');
        }

        return cita;
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

        // Validar solapamiento
        const conflicto = await prisma.cita.findFirst({
            where: {
                id_profesional: data.id_profesional,
                estado: { notIn: [EstadoCita.CANCELADA, EstadoCita.RECHAZADA] },
                fecha_hora_inicio: { lt: fechaFinalizacionEsperada },
                fecha_hora_finalizacion_esperada: { gt: fechaInicio }
            }
        });
        if (conflicto) {
            throw AppError.badRequest('El profesional ya tiene otra cita en este horario.');
        }

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


    async cambiarEstado( id: number, data: CambiarEstadoCitaDto, usuarioAutenticado: AuthTokenPayload) {

        // Buscar cita y los datos necesarios para
        // comprobar quién es el cliente y quién es
        // el profesional asignado.
        const cita =
            await prisma.cita.findUnique({

                where: { id,},

                select: {
                    id: true,
                    estado: true,
                    fecha_hora_finalizacion_esperada: true,
                    id_cliente: true,
                    id_profesional: true,
                    id_servicio: true,
                    profesional: {
                        select: {
                            id_usuario: true,
                        },
                    },
                },
            });


        if (!cita) {
            throw AppError.badRequest( "La cita seleccionada no existe");
        }


        // Identificar quien hace la acción
        const esClientePropietario =
            usuarioAutenticado.rol === Rol.CLIENTE &&
            cita.id_cliente === usuarioAutenticado.id;


        const esProfesionalAsignado =
            usuarioAutenticado.rol === Rol.PROFESIONAL &&
            cita.profesional.id_usuario ===
                usuarioAutenticado.id;


        // Validar transición + Rol
        let cambioPermitido = false;


        switch (cita.estado) {

            // Cita Pendiente
            case EstadoCita.PENDIENTE:

                // Profesional asignado puede aceptar
                if ( data.estado === EstadoCita.ACEPTADA && esProfesionalAsignado) {
                    cambioPermitido = true;
                }

                // Profesional asignado puede rechazar
                if ( data.estado === EstadoCita.RECHAZADA && esProfesionalAsignado) {
                    cambioPermitido = true;
                }

                // Cliente dueño puede cancelar
                if ( data.estado === EstadoCita.CANCELADA && esClientePropietario) {
                    cambioPermitido = true;
                }
                break;

            // Cita Aceptada
            case EstadoCita.ACEPTADA:

                // Profesional asignado puede completar
                if ( data.estado === EstadoCita.COMPLETADA && esProfesionalAsignado) {
                    cambioPermitido = true;
                }

                // Cliente dueño o profesional asignado
                // pueden cancelar una cita aceptada.
                if (data.estado === EstadoCita.CANCELADA && ( esClientePropietario || esProfesionalAsignado)) {
                    cambioPermitido = true;
                }
                break;

            // RECHAZADA, CANCELADA y COMPLETADA
            // son estados finales.
            default:
                cambioPermitido = false;
                break;
        }


        if (!cambioPermitido) {

            throw AppError.badRequest(
                `No tiene permiso para cambiar una cita ` +
                `de ${cita.estado} a ${data.estado}`
            );

        }

        // Validar Completada
        if ( data.estado === EstadoCita.COMPLETADA && new Date() < cita.fecha_hora_finalizacion_esperada) {
            throw AppError.badRequest( "La cita todavía no puede marcarse como completada");
        }

        // MOTIVO / COMENTARIO
        const motivo = data.comentario_profesional?.trim() || null;


        // Rechazo siempre requiere motivo
        if ( data.estado === EstadoCita.RECHAZADA && !motivo) {

            throw AppError.badRequest("Debe indicar el motivo por el que se rechaza la cita");
        }


        // Cancelación de una cita ACEPTADA
        // requiere motivo.
        if ( cita.estado === EstadoCita.ACEPTADA && data.estado === EstadoCita.CANCELADA && !motivo) {

            throw AppError.badRequest( "Debe indicar el motivo por el que se cancela la cita");
        }


        // Actualizar + Historial
        return await prisma.$transaction(
            async (tx) => {

                const citaActualizada =
                    await tx.cita.update({

                        where: { id,},

                        data: {
                            estado: data.estado,

                            // Solo se guarda aquí si
                            // quien escribe es profesional.
                            comentario_profesional:
                                usuarioAutenticado.rol ===
                                Rol.PROFESIONAL
                                    ? motivo
                                    : undefined,

                            fecha_hora_finalizacion_real:
                                data.estado ===
                                EstadoCita.COMPLETADA
                                    ? new Date()
                                    : undefined,
                        },
                        select: {
                            id: true,
                            estado: true,
                            comentario_profesional: true,
                            fecha_hora_finalizacion_real: true,
                            updateAt: true,
                        },
                    });


                await tx.historialCita.create({

                    data: {

                        id_cita: cita.id,
                        estado_anterior: cita.estado,
                        estado_nuevo: data.estado,
                        comentario: motivo,
                        realizado_por: usuarioAutenticado.rol,
                        id_usuario: usuarioAutenticado.id,
                        id_cliente: cita.id_cliente,
                        id_profesional: cita.id_profesional,
                        id_servicio: cita.id_servicio,
                    },

                });

                return citaActualizada;
            }
        );
    },
}