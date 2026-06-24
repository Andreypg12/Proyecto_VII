import { Container } from "winston";
import { prisma } from "../config/prisma";

export const categoriaServicioService = {

    async listar(filtros?: {buscar?: string, estado?: boolean}) {
        const where: any = {};

        if (filtros?.buscar) {
            where.categoria = {
            contains: filtros.buscar.trim(),
            }
        }

        if (filtros?.estado !== undefined) {
            where.estado = filtros.estado;
        }

        return await prisma.categoriaServicio.findMany({
            where,
            select:{
                id: true,
                categoria: true,
                descripcion: true,
                estado: true,
            },
            orderBy: 
            { 
                categoria:"asc" 
            }
        });
    },
    async obtenerPorId(categoriaServicioID: number) {
        return await prisma.categoriaServicio.findFirst({
            where: {
                id: categoriaServicioID
            }
        })
    }

}