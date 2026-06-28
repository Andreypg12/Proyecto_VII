import { id } from "zod/locales";
import { prisma } from "../config/prisma";
import { CreateEspecialidadDto, UpdateEspecialidadDto } from "../dtos/especialidad.dto";

export const especialidadService = {

    async listar(filtros?: {buscar?: string; estado?: boolean}) {

        const where: any = {};

        if (filtros?.buscar) {
            where.especialidad = {
                contains: filtros.buscar.trim(),
            };
        }

        if (filtros?.estado !== undefined) {
            where.estado = filtros.estado;
        }


        return await prisma.especialidad.findMany({
            where,
            select: {
                id: true,
                especialidad: true,
                estado: true,
            },
            orderBy: 
            {
                especialidad: "asc" 
            },
        });
    },
    async obtenerPorId(especialidadId: number) {
        return await prisma.especialidad.findFirst({
            where: { id: especialidadId },
            include: {
                perfiles_profesionales: true,
                servicios: true
            }
        });
    },

    async crear(data: CreateEspecialidadDto) {

        //Aquí se colocan las validaciones.


        //

        return prisma.especialidad.create({
            data: {
                especialidad: data.especialidad,
                descripcion: data.descripcion,
                estado: data.estado ?? true,

                perfiles_profesionales: data.perfiles_profesionales && data.perfiles_profesionales.length > 0
                    ? {
                        connect: data.perfiles_profesionales.map((id: number) => ({ 
                            id 
                        })),
                    }
                    : undefined,

                
                servicios: data.servicios && data.servicios.length > 0
                    ? {
                        connect: data.servicios.map((id: number) => ({ 
                            id 
                        })),
                    }
                    : undefined,
            },
            include: {
                perfiles_profesionales: true,
                servicios: true,
            },
        });
    },

    async actualizar(id: number, data: UpdateEspecialidadDto) {
        //Aquí se colocan las validaciones.

        //
        return prisma.especialidad.update({
            where: {id},
            data: {
                especialidad: data.especialidad,
                descripcion: data.descripcion,
                estado: data.estado,

                perfiles_profesionales: data.perfiles_profesionales
                    ? {
                        set: data.perfiles_profesionales.map((id) => ({ id })),
                    }
                    : undefined,

                
                servicios: data.servicios
                    ? {
                        connect: data.servicios.map((id) => ({ id })),
                    }
                    : undefined,
            },
            include: {
                perfiles_profesionales: true,
                servicios: true,
            },
        });
    },
    


}