import { id } from "zod/locales";
import { prisma } from "../config/prisma";
import { CreateEspecialidadDto } from "../dtos/especialidad.dto";

export const especialidadService = {

    async listar() {
        return await prisma.especialidad.findMany({
            orderBy: { especialidad: "asc" }
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
        return prisma.especialidad.create({
            data: {
                especialidad: data.especialidad,
                descripcion: data.descripcion,
                estado: data.estado ?? true,

                perfiles_profesionales: data.perfiles_profesionales && data.perfiles_profesionales.length > 0
                    ? {
                        connect: data.perfiles_profesionales.map((id: number) => ({ id })),
                    }
                    : undefined,

                
                servicios: data.servicios && data.servicios.length > 0
                    ? {
                        connect: data.servicios.map((id: number) => ({ id })),
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