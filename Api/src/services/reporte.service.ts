import { prisma } from "../config/prisma";
import { EstadoCita } from "../../generated/prisma/enums";

interface FiltrosReporteCitasEstado {
    fechaDesde?: Date;
    fechaHasta?: Date;
    idProfesional?: number;
    idCategoria?: number;
}

export const reporteService = {

      //Reporte #1
    async citasPorEstado(filtros: FiltrosReporteCitasEstado) {

        const where = {
            ...(filtros.fechaDesde || filtros.fechaHasta
                ? {
                    fecha_hora_inicio: {
                        ...(filtros.fechaDesde
                            ? { gte: filtros.fechaDesde }
                            : {}),
                        ...(filtros.fechaHasta
                            ? { lte: filtros.fechaHasta }
                            : {}),
                    },
                }
                : {}),

            ...(filtros.idProfesional
                ? {
                    id_profesional: filtros.idProfesional,
                }
                : {}),

            ...(filtros.idCategoria
                ? {
                    servicio: {
                        id_categoria: filtros.idCategoria,
                    },
                }
                : {}),
        };

        const agrupados = await prisma.cita.groupBy({
            by: ["estado"],
            where,
            _count: {
                _all: true,
            },
        });

        const totalGeneral = agrupados.reduce(
            (acumulado, item) =>
                acumulado + item._count._all,
            0
        );

        const estadosReporte = [
            EstadoCita.PENDIENTE,
            EstadoCita.ACEPTADA,
            EstadoCita.RECHAZADA,
            EstadoCita.CANCELADA,
            EstadoCita.COMPLETADA,
        ];

        const estados = estadosReporte.map((estado) => {

            const registro = agrupados.find(
                (item) => item.estado === estado
            );

            const cantidad =
                registro?._count._all ?? 0;

            const porcentaje =
                totalGeneral > 0
                    ? Number(
                        (
                            (cantidad / totalGeneral) *
                            100
                        ).toFixed(2)
                    )
                    : 0;

            return {
                estado,
                cantidad,
                porcentaje,
            };
        });

        return {
            totalGeneral,
            estados,
        };
    },




    //Reporte #2
    async citasPorProfesional(idProfesional?: number) {

        // Obtener profesionales reales
        const profesionales =
            await prisma.perfilProfesional.findMany({
                where: idProfesional ? { id: idProfesional }: undefined,
                select: {
                    id: true,
                    usuario: {
                        select: {
                            nombre: true,
                            apellidos: true
                        }
                    }
                },
                orderBy: {
                    usuario: {
                        nombre: 'asc'
                    }
                }
            });


        // Total de citas agrupadas por profesional
        const totalCitas =
            await prisma.cita.groupBy({
                by: ['id_profesional'],
                where: idProfesional ? { id_profesional: idProfesional }: undefined,
                _count: { _all: true}
            });


        // Solo citas completadas
        const citasCompletadas =
            await prisma.cita.groupBy({
                by: ['id_profesional'],
                where: { estado: EstadoCita.COMPLETADA,
                    ...(idProfesional ? { id_profesional: idProfesional }: {})
                },
                _count: { _all: true}
            });


        const reporte =
            profesionales.map(
                profesional => {
                    const registroTotal =
                        totalCitas.find(
                            item =>
                                item.id_profesional ===
                                profesional.id
                        );

                    const registroCompletadas =
                        citasCompletadas.find(
                            item =>
                                item.id_profesional ===
                                profesional.id
                        );

                    const total =
                        registroTotal?._count._all
                        ?? 0;

                    const completadas =
                        registroCompletadas?._count._all
                        ?? 0;

                    const porcentajeFinalizacion =
                        total > 0
                            ? Number(
                                (
                                    (
                                        completadas /
                                        total
                                    ) * 100
                                ).toFixed(2)
                            )
                            : 0;

                    return {

                        idProfesional: profesional.id,
                        profesional: `${profesional.usuario.nombre} ${profesional.usuario.apellidos}`,
                        totalCitas: total,
                        citasCompletadas: completadas,
                        porcentajeFinalizacion
                    };
                }
            );

        return reporte;
    },

    // Reporte #3
    async calificaciones(idProfesional?: number) {

        const profesionales =
            await prisma.perfilProfesional.findMany({

                where: idProfesional
                    ? {
                        id: idProfesional
                    }
                    : undefined,

                select: {

                    id: true,

                    usuario: {
                        select: {
                            nombre: true,
                            apellidos: true
                        }
                    },

                    valoracion: {
                        select: {

                            puntuacion: true,

                            cita: {
                                select: {

                                    servicio: {
                                        select: {
                                            id: true,
                                            servicio: true
                                        }
                                    }

                                }
                            }

                        }
                    }

                },

                orderBy: {
                    usuario: {
                        nombre: 'asc'
                    }
                }
            });


        // Consideramos baja una calificación
        // cuyo promedio sea menor a 3.
        const UMBRAL_BAJA_CALIFICACION = 3;


        return profesionales.map(
            profesional => {

                const valoraciones =
                    profesional.valoracion;


                // PROMEDIO GENERAL DEL PROFESIONAL

                const cantidadResenas =
                    valoraciones.length;


                const totalPuntuacion =
                    valoraciones.reduce(
                        (total, valoracion) =>
                            total + valoracion.puntuacion,
                        0
                    );


                const promedioCalificacion =
                    cantidadResenas > 0
                        ? Number(
                            (
                                totalPuntuacion /
                                cantidadResenas
                            ).toFixed(2)
                        )
                        : 0;


                // AGRUPAR CALIFICACIONES POR SERVICIO

                const serviciosMap =
                    new Map<
                        number,
                        {
                            servicio: string;
                            totalPuntuacion: number;
                            cantidadResenas: number;
                        }
                    >();


                for (const valoracion of valoraciones) {

                    const servicio =
                        valoracion.cita.servicio;


                    const servicioExistente =
                        serviciosMap.get(
                            servicio.id
                        );


                    if (servicioExistente) {

                        servicioExistente.totalPuntuacion +=
                            valoracion.puntuacion;

                        servicioExistente.cantidadResenas += 1;

                    } else {

                        serviciosMap.set(
                            servicio.id,
                            {
                                servicio:
                                    servicio.servicio,

                                totalPuntuacion:
                                    valoracion.puntuacion,

                                cantidadResenas: 1
                            }
                        );
                    }
                }


                // CALCULAR PROMEDIO DE CADA SERVICIO

                const servicios =
                    Array.from(
                        serviciosMap.values()
                    ).map(
                        item => ({

                            servicio:
                                item.servicio,

                            promedio:
                                Number(
                                    (
                                        item.totalPuntuacion /
                                        item.cantidadResenas
                                    ).toFixed(2)
                                ),

                            cantidadResenas:
                                item.cantidadResenas
                        })
                    );


                // MEJOR SERVICIO CALIFICADO

                const mejorPromedio =
                    servicios.length > 0
                        ? Math.max(
                            ...servicios.map(
                                item =>
                                    item.promedio
                            )
                        )
                        : null;


                
               // Usamos un arreglo porque puede haber
               // dos o más servicios empatados con la mejor calificación.
                const mejoresServicios =
                    mejorPromedio !== null
                        ? servicios
                            .filter(
                                item =>
                                    item.promedio ===
                                    mejorPromedio
                            )
                            .map(
                                item => ({
                                    servicio:
                                        item.servicio,

                                    promedio:
                                        item.promedio
                                })
                            )
                        : [];

                // SERVICIOS CON BAJA CALIFICACIÓN

                const serviciosBajaCalificacion =
                    servicios
                        .filter(
                            item =>
                                item.promedio <
                                UMBRAL_BAJA_CALIFICACION
                        )
                        .map(
                            item => ({
                                servicio:
                                    item.servicio,

                                promedio:
                                    item.promedio
                            })
                        );


                // RESULTADO

                return {

                    idProfesional:
                        profesional.id,

                    profesional:
                        `${profesional.usuario.nombre} ${profesional.usuario.apellidos}`,

                    promedioCalificacion,

                    cantidadResenas,

                    mejoresServicios,

                    serviciosBajaCalificacion,

                    umbralBajaCalificacion:
                        UMBRAL_BAJA_CALIFICACION
                };
            }
        );
    }
    
};