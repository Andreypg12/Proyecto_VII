import { prisma } from "../config/prisma";
import { Rol } from "../../generated/prisma/enums";
import { ro } from "zod/locales";
import { CreateUsuarioDto, UpdateUsuarioDto } from "../dtos/usuario.dto";

export const usuarioService = {

    async listar(filtros?: {buscar?: string; rol?: Rol}) {
        const where: any = {};

        if (filtros?.buscar) {
            const textoBusqueda = filtros.buscar.trim();

            where.OR = [
                { nombre: { contains: textoBusqueda } },
                { apellidos: { contains: textoBusqueda } },
                { email: { contains: textoBusqueda } },
            ];
        }

        if (filtros?.rol) {
            where.rol = filtros.rol;
        }

        return await prisma.usuario.findMany({
            where,
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                rol: true,
                estado: true,
            },
            orderBy: {
                id: "asc",
            },
        });
    },

    async obtenerPorId(usuarioId: number) {
        return await prisma.usuario.findFirst({
            where: {
                id: usuarioId
            }
        })
    },

    async crear(data: CreateUsuarioDto){
        
        return await prisma.usuario.create({

            data: {
                email: data.email,
                nombre: data.nombre,
                apellidos: data.apellidos,
                password: data.password,
                rol: data.rol ?? "CLIENTE",
                estado: data.estado ?? "ACTIVO",
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                apellidos: true,
                rol: true,
                estado: true,
            },
        });
    },

    async actualizar(id: number, data: UpdateUsuarioDto) {

        return await prisma.usuario.update({
            where: { id },
            data: {
                email: data.email,
                nombre: data.nombre,
                apellidos: data.apellidos,
                password: data.password,
                rol: data.rol,
                estado: data.estado,
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                apellidos: true,
                rol: true,
                estado: true,
            },
        });
    },


    async bloquear(id: number) {

        const usuario = await this.obtenerPorId(id)

        if (usuario != null) {
            const usuarioActualizado = await prisma.usuario.update({
                where: { id },
                data: {
                    estado: "BLOQUEADO"
                }
            })
            return usuarioActualizado
        }
        return false

    },

    async activar(id: number) {

        const usuario = await this.obtenerPorId(id)

        if (usuario != null) {
            const usuarioActualizado = await prisma.usuario.update({
                where: { id },
                data: {
                    estado: "ACTIVO"
                }
            })

            return usuarioActualizado
        }
        return false

    },

}