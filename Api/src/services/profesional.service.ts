import { Rol } from "../../generated/prisma/enums";
import { prisma } from "../config/prisma";
import { UpdateEspecialidadDto } from "../dtos/especialidad.dto";
import { CreateProfesionalDto, UpdateProfesionalDto } from "../dtos/profesional.dto";
import { AppError } from "../utils/app-error";


export interface ProfesionalFilters {
    nombre?: string;
    modalidad?: string;
    disponibilidad?: boolean;
    pagina?: number;
    limite?: number;
}

export const profesionalService = {

    async listar(filtros?: ProfesionalFilters) {
        try {
            // Paginación con valores por defecto y límite seguro
            const pagina = Math.max(1, filtros?.pagina || 1);
            const limite = Math.min(Math.max(1, filtros?.limite || 10), 100);
            const skip = (pagina - 1) * limite;

            // Construir filtros dinámicamente
            const where: any = {};

            if (filtros?.nombre) {
                const searchTerm = filtros.nombre.trim().toLowerCase();
                where.OR = [
                    {
                        usuario: {
                            nombre: {
                                contains: searchTerm,
                            }
                        }
                    },
                    {
                        usuario: {
                            apellidos: {
                                contains: searchTerm,
                            }
                        }
                    }
                ];
            }

            if (filtros?.modalidad) {
                where.modalidad = filtros.modalidad;
            }

            if (filtros?.disponibilidad !== undefined) {
                where.disponibilidad = filtros.disponibilidad;
            }

            // Ejecutar consultas en paralelo para mejor rendimiento
            const [total, profesionales] = await Promise.all([
                prisma.perfilProfesional.count({ where }),
                prisma.perfilProfesional.findMany({
                    where,
                    skip,
                    take: limite,
                    orderBy: { usuario: { nombre: 'asc' } },
                    select: {
                        id: true,
                        titulo: true,
                        descripcion: true,
                        tarifa_por_hora: true,
                        annos_experiencia: true,
                        imagen_profesional: true,
                        disponibilidad: true,
                        modalidad: true,
                        telefono: true,
                        usuario: {
                            select: {
                                id: true,
                                email: true,
                                nombre: true,
                                apellidos: true,
                                rol: true
                            }
                        },
                        servicios: {
                            select: {
                                id: true,
                                servicio: true,
                                precio: true
                            }
                        },
                        ubicaciones: {
                            select: {
                                id: true,
                                descripcion: true,
                                distrito: true,
                                canton: true,
                                ciudad: true
                            }
                        },
                        especialidades: {
                            select: {
                                id: true,
                                especialidad: true
                            }
                        }
                    }
                })
            ]);

            return {
                data: profesionales,
                meta: {
                    total,
                    pagina,
                    limite,
                    totalPaginas: Math.ceil(total / limite),
                    filtrosAplicados: {
                        nombre: filtros?.nombre,
                        modalidad: filtros?.modalidad,
                        disponibilidad: filtros?.disponibilidad
                    }
                }
            };

        } catch (error) {
            console.error('Error en listar profesionales:', error);
            throw AppError.badRequest("Error al listar profesionales");
        }
    },

    async obtenerPorId(id: number) {
        return await prisma.perfilProfesional.findUnique({
            where: { id },
            include: {
                usuario: true,
                servicios: true,
                ubicaciones: true,
                especialidades: true
            }
        });
    },

    async crear(data: CreateProfesionalDto) {

        if (data.especialidades_Ids?.length) {
            await this.validateEspecialidades(data.especialidades_Ids)
        }

        const usuario = await prisma.usuario.create({
            data: {
                email: data.usuario.email,
                nombre: data.usuario.nombre,
                apellidos: data.usuario.apellidos,
                password: data.usuario.password,
                rol: Rol.PROFESIONAL
            }
        })

        const profesional = await prisma.perfilProfesional.create({
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                tarifa_por_hora: data.tarifa_por_hora,
                annos_experiencia: data.annos_experiencia,
                imagen_profesional: data.imagen_profesional ?? "image-not-found.jpg",
                disponibilidad: data.disponibilidad ?? true,
                modalidad: data.modalidad,
                telefono: data.telefono ?? "00000000",
                id_usuario: usuario.id,
                especialidades: {
                    connect: data.especialidades_Ids?.map(id => ({ id })) || []
                }
            }
        });

        await prisma.ubicacionProfesional.create({
            data: {
                descripcion: data.ubicacion.descripcion,
                id_distrito: data.ubicacion.id_distrito,
                distrito: data.ubicacion.distrito,
                canton: data.ubicacion.canton,
                ciudad: data.ubicacion.ciudad,
                id_profesional: profesional.id
            }
        });

        return profesional

    },

    async actualizar(id: number, data: UpdateProfesionalDto) {

        const profesionalExistente = await this.obtenerPorId(id)

        if (profesionalExistente == null)
            return

        if (data.especialidades_Ids?.length) {
            await this.validateEspecialidades(data.especialidades_Ids)
        }

        if (data.usuario != null) {
            await prisma.usuario.update({
                where: { id: profesionalExistente.id_usuario },
                data: {
                    email: data.usuario?.email,
                    nombre: data.usuario?.nombre,
                    apellidos: data.usuario?.apellidos,
                    password: data.usuario?.password,
                    rol: Rol.PROFESIONAL
                }
            })
        }


        const profesional = await prisma.perfilProfesional.update({
            where: { id },
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                tarifa_por_hora: data.tarifa_por_hora,
                annos_experiencia: data.annos_experiencia,
                imagen_profesional: data.imagen_profesional ?? "image-not-found.jpg",
                disponibilidad: data.disponibilidad ?? true,
                modalidad: data.modalidad,
                telefono: data.telefono ?? "00000000",
                especialidades: data.especialidades_Ids ? {
                    set: data.especialidades_Ids.map((id) => ({ id })),
                }
                    : undefined,
            },
            include: {
                especialidades: true,
                ubicaciones: true,
                usuario: true
            },
        });

        if (data.ubicacion) {
            // Buscar la ubicación existente
            const ubicacionExistente = await prisma.ubicacionProfesional.findFirst({
                where: { id_profesional: id }
            });

            if (ubicacionExistente) {
                // Actualizar ubicación existente
                await prisma.ubicacionProfesional.update({
                    where: { id: ubicacionExistente.id },
                    data: {
                        descripcion: data.ubicacion.descripcion,
                        id_distrito: data.ubicacion.id_distrito,
                        distrito: data.ubicacion.distrito,
                        canton: data.ubicacion.canton,
                        ciudad: data.ubicacion.ciudad,
                    }
                });
            } else {
                // Crear nueva ubicación si no existe
                await prisma.ubicacionProfesional.create({
                    data: {
                        descripcion: data.ubicacion.descripcion,
                        id_distrito: data.ubicacion.id_distrito,
                        distrito: data.ubicacion.distrito,
                        canton: data.ubicacion.canton,
                        ciudad: data.ubicacion.ciudad,
                        id_profesional: id
                    }
                });
            }
        }

        return profesional
    },

    async cambiarDisponibilidad(id: number) {

        const profesional = await this.obtenerPorId(id);

        if (!profesional) {
            throw AppError.notFound(`Profesional con ID ${id} no encontrado`);
        }

        return await prisma.perfilProfesional.update({
            where: { id },
            data: {
                disponibilidad: !profesional.disponibilidad
            },
            select: {
                id: true,
                disponibilidad: true,
                telefono: true,
                usuario: {
                    select: {
                        id: true,
                        email: true,
                        nombre: true,
                        apellidos: true,
                        rol: true
                    }
                },
            }
        });
    },

    async validateEspecialidades(especialidadIds: number[]) {
        const count = await prisma.especialidad.count({
            where: {
                id: {
                    in: especialidadIds,
                },
            },
        });
        if (count !== especialidadIds.length) {
            throw AppError.badRequest("Una o más especialidades no existen");
        }
    },
};