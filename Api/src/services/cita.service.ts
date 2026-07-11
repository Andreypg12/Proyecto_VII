import { prisma } from '../config/prisma';
import {EstadoCita,EstadoUsuario,Modalidad,Rol,} from '../../generated/prisma/enums';
import { CreateCitaDto } from '../dtos/cita.dto';
import { AppError } from '../utils/app-error';

interface FiltrosCita {
    estado?: EstadoCita;
    idProfesional?: number;
    fechaDesde?: string;
    fechaHasta?: string;
}


const ZONA_HORARIA_NEGOCIO = 'America/Costa_Rica';
const DURACION_CITA_MINUTOS = 60;
const HORAS_INICIO_PERMITIDAS = new Set([
    '09:00',
    '10:00',
    '11:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
]);


function obtenerHoraCostaRica(fecha: Date): string {

    const partes = new Intl.DateTimeFormat(
        'en-GB',
        {
            timeZone: ZONA_HORARIA_NEGOCIO,
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        }
    ).formatToParts(fecha);

    const hora = partes.find(
        (parte) => parte.type === 'hour'
    )?.value;

    const minuto = partes.find(
        (parte) => parte.type === 'minute'
    )?.value;

    if (!hora || !minuto) {
        throw AppError.badRequest(
            'No fue posible interpretar la hora de la cita'
        );
    }

    return `${hora}:${minuto}`;
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

    
    async crear(
        data: CreateCitaDto
    ) {

        
        const fechaInicio =
            new Date(
                data.fecha_hora_inicio
            );

        if (
            Number.isNaN(
                fechaInicio.getTime()
            )
        ) {
            throw AppError.badRequest(
                'La fecha y hora de inicio no son válidas'
            );
        }

        if (
            fechaInicio <= new Date()
        ) {
            throw AppError.badRequest(
                'La fecha y hora de la cita deben ser posteriores a la fecha actual'
            );
        }

        if (
            !Object.values(
                Modalidad
            ).includes(
                data.modalidad as Modalidad
            )
        ) {
            throw AppError.badRequest(
                'La modalidad seleccionada no es válida'
            );
        }

        const horaCostaRica =
            obtenerHoraCostaRica(
                fechaInicio
            );

        if (
            !HORAS_INICIO_PERMITIDAS.has(
                horaCostaRica
            )
        ) {
            throw AppError.badRequest(
                'La hora seleccionada no corresponde a un horario permitido'
            );
        }

        const comentario =
            data.comentario_cliente
                ?.trim();

        if (!comentario) {
            throw AppError.badRequest(
                'Debe ingresar una descripción o comentario'
            );
        }

        if (
            comentario.length > 500
        ) {
            throw AppError.badRequest(
                'El comentario no puede superar los 500 caracteres'
            );
        }

        const cliente =
            await prisma.usuario.findFirst({
                where: {
                    id: data.id_cliente,
                    rol: Rol.CLIENTE,

                    estado:
                        EstadoUsuario.ACTIVO,
                },
            });

        if (!cliente) {
            throw AppError.badRequest(
                'El cliente seleccionado no existe o no se encuentra activo'
            );
        }

        
        const profesional =
            await prisma
                .perfilProfesional
                .findFirst({
                    where: {
                        id:
                            data.id_profesional,

                        disponibilidad:
                            true,

                        usuario: {
                            estado:
                                EstadoUsuario.ACTIVO,

                            rol:
                                Rol.PROFESIONAL,
                        },
                    },
                });

        if (!profesional) {
            throw AppError.badRequest(
                'El profesional seleccionado no existe o no se encuentra disponible'
            );
        }

        
        const servicio =
            await prisma.servicio.findFirst({
                where: {
                    id:
                        data.id_servicio,

                    estado:
                        true,

                    id_profesional:
                        data.id_profesional,
                },
            });

        if (!servicio) {
            throw AppError.badRequest(
                'El servicio seleccionado no existe, está desactivado o no pertenece al profesional indicado'
            );
        }

        
        if (
            servicio.modalidad !==
                Modalidad.HÍBRIDA &&

            servicio.modalidad !==
                data.modalidad
        ) {
            throw AppError.badRequest(
                `El servicio solamente se ofrece en modalidad ${servicio.modalidad}`
            );
        }

        
        const fechaFinalizacionEsperada = new Date( fechaInicio.getTime() + DURACION_CITA_MINUTOS * 60 * 1000 );

        return prisma.cita.create({
            data: {
                fecha_hora_inicio:
                    fechaInicio,

                fecha_hora_finalizacion_esperada:
                    fechaFinalizacionEsperada,

                fecha_hora_finalizacion_real:
                    null,

                comentario_cliente:
                    comentario,

                
                monto_estimado:
                    servicio.precio,

                modalidad:
                    data.modalidad,

                
                estado:
                    EstadoCita.PENDIENTE,

                id_cliente:
                    data.id_cliente,

                id_profesional:
                    data.id_profesional,

                id_servicio:
                    data.id_servicio,
            },

            select: {
                id: true,

                fecha_hora_inicio:
                    true,

                fecha_hora_finalizacion_esperada:
                    true,

                fecha_hora_finalizacion_real:
                    true,

                comentario_cliente:
                    true,

                monto_estimado:
                    true,

                modalidad:
                    true,

                estado:
                    true,

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

                        duracion_estimada:
                            true,

                        modalidad: true,
                    },
                },
            },
        });
    },
};