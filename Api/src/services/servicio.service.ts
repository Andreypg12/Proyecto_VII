import { Rol } from "../../generated/prisma/enums";
import { prisma } from "../config/prisma";
import { CreateServicioDto, UpdateServicioDto } from "../dtos/servicio.dto";
import { AuthTokenPayload } from "../middlewares/auth.middleware";
import { AppError } from "../utils/app-error";

export interface ServicioFilters {
    nombre?: string;
    categoria?: string;
    modalidad?: string;
    precio_min?: number;
    precio_max?: number;
    pagina?: number;
    limite?: number;
    orderBy?: 'nombre' | 'precio' | 'duracion';
    orderDir?: 'asc' | 'desc';
}

export const servicioService = {
    async listar(filtros?: ServicioFilters) {
        try {
            // Paginación
            const pagina = Math.max(1, filtros?.pagina || 1);
            const limite = Math.min(Math.max(1, filtros?.limite || 24), 100);
            const skip = (pagina - 1) * limite;

            // Construir WHERE dinámico
            const where: any = {};

            // 1. FILTRO POR NOMBRE (búsqueda en servicio y descripción)
            if (filtros?.nombre) {
                const searchTerm = filtros.nombre.trim();
                where.OR = [
                    { servicio: { contains: searchTerm } },
                    { categoria: { categoria: { contains: searchTerm } } }
                ];
            }

            // 2. FILTRO POR CATEGORÍA
            if (filtros?.categoria) {
                where.categoria = {
                    categoria: {
                        contains: filtros.categoria
                    }
                };
            }

            // 3. FILTRO POR MODALIDAD
            if (filtros?.modalidad) {
                where.modalidad = filtros.modalidad;
            }

            // 4. FILTRO POR RANGO DE PRECIO
            if (filtros?.precio_min !== undefined || filtros?.precio_max !== undefined) {
                where.precio = {};
                if (filtros.precio_min !== undefined) {
                    where.precio.gte = filtros.precio_min;
                }
                if (filtros.precio_max !== undefined) {
                    where.precio.lte = filtros.precio_max;
                }
            }

            // Construir ORDER BY
            let orderBy: any = {};
            switch (filtros?.orderBy) {
                case 'nombre':
                    orderBy = { servicio: filtros.orderDir || 'asc' };
                    break;
                case 'precio':
                    orderBy = { precio: filtros.orderDir || 'asc' };
                    break;
                case 'duracion':
                    orderBy = { duracion_estimada: filtros.orderDir || 'asc' };
                    break;
                default:
                    orderBy = { servicio: 'asc' };
            }

            // Ejecutar consultas en paralelo
            const [total, servicios] = await Promise.all([
                prisma.servicio.count({ where }),
                prisma.servicio.findMany({
                    where,
                    skip,
                    take: limite,
                    orderBy,
                    select: {
                        id: true,
                        servicio: true,
                        descripcion: true,
                        precio: true,
                        duracion_estimada: true,
                        estado: true,
                        modalidad: true,
                        createdAt: true,
                        updateAt: true,

                        id_categoria: true,

                        categoria: {
                            select: {
                                id: true,
                                categoria: true,
                                descripcion: true
                            }
                        },

                        id_profesional: true,

                        profesional: {
                            select: {
                                id: true,
                                titulo: true,
                                tarifa_por_hora: true,
                                disponibilidad: true,
                                usuario: {
                                    select: {
                                        id: true,
                                        nombre: true,
                                        apellidos: true,
                                        email: true
                                    }
                                }
                            }
                        },
                        especialidades: {
                            select: {
                                id: true,
                                especialidad: true,
                                descripcion: true,
                                estado: true
                            }
                        }
                    }
                })
            ]);

            return {
                data: servicios,
                meta: {
                    total,
                    pagina,
                    limite,
                    totalPaginas: Math.ceil(total / limite),
                    filtrosAplicados: {
                        nombre: filtros?.nombre,
                        categoria: filtros?.categoria,
                        modalidad: filtros?.modalidad,
                        precio_min: filtros?.precio_min,
                        precio_max: filtros?.precio_max
                    }
                }
            };

        } catch (error) {
            console.error('Error en listar servicios:', error);
            throw AppError.badRequest("Error al listar servicios");
        }
    },

    async obtenerPorId(id: number) {
        return await prisma.servicio.findUnique({
            where: { id },
            select: {
                id: true,
                servicio: true,
                descripcion: true,
                precio: true,
                duracion_estimada: true,
                estado: true,
                modalidad: true,
                createdAt: true,
                updateAt: true,

                id_categoria: true,
                categoria: {
                    select: {
                        id: true,
                        categoria: true,
                        descripcion: true
                    }
                },
                especialidades: {
                    select: {
                        id: true,
                        especialidad: true,
                        descripcion: true,
                        estado: true
                    }
                },

                id_profesional: true,
                profesional: {
                    select: {
                        id: true,
                        titulo: true,
                        tarifa_por_hora: true,
                        disponibilidad: true,
                        imagen_profesional: true,
                        usuario: {
                            select: {
                                id: true,
                                nombre: true,
                                apellidos: true,
                                email: true,

                            }
                        }
                    }
                },
            }
        });
    },

    async crear(data: CreateServicioDto, usuarioAutenticado: AuthTokenPayload) {

        if (usuarioAutenticado.rol !== Rol.PROFESIONAL) {
            throw AppError.badRequest("Solo los profesionales pueden crear servicios");
        }

        const profesional = await prisma.perfilProfesional.findFirst({
            where: { id_usuario: usuarioAutenticado.id }
        });

        if (!profesional) {
            throw AppError.notFound("Perfil de profesional no encontrado para este usuario");
        }

        if (data.categoria_id) {
            await this.validateCategoria(data.categoria_id)
        }

        if (data.especialidades_Ids?.length) {
            await this.validateEspecialidades(data.especialidades_Ids)
        }

        return await prisma.servicio.create({
            data: {
                servicio: data.servicio,
                descripcion: data.descripcion,
                precio: data.precio,
                duracion_estimada: data.duracion_estimada,
                modalidad: data.modalidad,
                id_profesional: profesional.id,
                id_categoria: data.categoria_id,
                especialidades: {
                    connect: data.especialidades_Ids?.map(id => ({ id })) || []
                }
            },
            include: {
                especialidades: true,
                categoria: true,
                profesional: true
            }
        })
    },

    async actualizar( id: number, data: UpdateServicioDto, usuarioAutenticado: AuthTokenPayload) {

        const servicioActual =
            await prisma.servicio.findUnique({

                where: { id },

                select: {
                    id: true,
                    id_profesional: true,

                    profesional: {
                        select: {
                            id: true,
                            id_usuario: true
                        }
                    }
                }

            });


        if (!servicioActual) {
            throw AppError.notFound( `Servicio con ID ${id} no encontrado`);
        }


        if (usuarioAutenticado.rol !== Rol.PROFESIONAL) {
            throw AppError.badRequest("No tiene permiso para modificar este servicio");
        }


        if ( servicioActual.profesional.id_usuario !== usuarioAutenticado.id) {
            throw AppError.badRequest("No puede modificar un servicio que pertenece a otro profesional");
        }


        // Validar categoría
        if (data.categoria_id) {
            await this.validateCategoria( data.categoria_id);
        }


        // Validar especialidades
        if (data.especialidades_Ids?.length) {
            await this.validateEspecialidades( data.especialidades_Ids);
        }


        return await prisma.servicio.update({

            where: { id },

            data: {

                servicio: data.servicio,
                descripcion: data.descripcion,
                precio: data.precio,
                duracion_estimada: data.duracion_estimada,
                modalidad: data.modalidad,
                id_categoria: data.categoria_id,
                estado: data.estado,
                especialidades:
                    data.especialidades_Ids
                        ? {
                            set:
                                data.especialidades_Ids.map(
                                    (id) => ({ id })
                                )
                        }
                        : undefined,

            },

            include: {
                especialidades:true,
                categoria: true,
                profesional: true
            }

        });
    },

    async cambiarEstado( id: number, usuarioAutenticado: AuthTokenPayload ) {

        const servicio = await prisma.servicio.findUnique({
                where: { id },
                select: {
                    id: true,
                    estado: true,

                    profesional: {
                        select: {
                            id_usuario: true
                        }
                    }
                }

            });

        if (!servicio) {
            throw AppError.notFound( `Servicio con ID ${id} no encontrado` );
        }

        if (usuarioAutenticado.rol !== Rol.PROFESIONAL ) {
            throw AppError.badRequest("No tiene permiso para modificar el estado de este servicio" );
        }

        if ( servicio.profesional.id_usuario !== usuarioAutenticado.id ) {
            throw AppError.badRequest( "No puede modificar un servicio que pertenece a otro profesional" );
        }


        return await prisma.servicio.update({

            where: { id },

            data: { estado: !servicio.estado },

            select: {
                id: true,
                servicio: true,
                estado: true,
                updateAt: true
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

    async validateCategoria(categoria_id: number) {
        const categoria = await prisma.categoriaServicio.findUnique({
            where: { id: categoria_id },
        });
        if (!categoria) {
            throw AppError.badRequest("La categoría indicada no existe");
        }
    },

    async validateProfesional(profesional_id: number) {
        const profesional = await prisma.perfilProfesional.findUnique({
            where: { id: profesional_id },
        });
        if (!profesional) {
            throw AppError.badRequest("El profesional indicada no existe");
        }
    },
};