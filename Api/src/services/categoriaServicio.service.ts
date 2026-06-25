import { Container } from "winston";
import { prisma } from "../config/prisma";
import { create } from "node:domain";
import { CreateCategoriaServicioDto, UpdateCategoriaServicioDto } from "../dtos/categoriaServicio.dto";

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
    },

    async create(data: CreateCategoriaServicioDto) {

        return await prisma.categoriaServicio.create({
            data: {
                categoria: data.categoria,
                descripcion: data.descripcion,
                estado: data.estado ?? true,
            },
            select: {
                id: true,
                categoria: true,
                descripcion: true,
                estado: true,
            },
        });
    },

    async actualizar(id: number, data: UpdateCategoriaServicioDto) {

        return await prisma.categoriaServicio.update({
            where: { id },
            data: {
                categoria: data.categoria,
                descripcion: data.descripcion,
                estado: data.estado,
            },
            select: {
                id: true,
                categoria: true,
                descripcion: true,
                estado: true,
            },
        });
    },

}