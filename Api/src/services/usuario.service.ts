import { prisma } from "../config/prisma";
import { Rol } from "../../generated/prisma/enums";
import { ro } from "zod/locales";
import { CreateUsuarioDto, UpdateUsuarioDto } from "../dtos/usuario.dto";
import { AppError } from "../utils/app-error";

export const usuarioService = {

    async listar(filtros?: { buscar?: string; rol?: Rol }) {

        // Objeto donde se construyen dinámicamente los filtros de Prisma
        const where: any = {};

        if (filtros?.buscar) {
            const textoBusqueda = filtros.buscar.trim();

            // Buscar coincidencias por nombre, apellidos o correo
            where.OR = [
                { nombre: { contains: textoBusqueda } },
                { apellidos: { contains: textoBusqueda } },
                { email: { contains: textoBusqueda } },
            ];
        }

         // Aplicar filtro por rol cuando fue enviado
        if (filtros?.rol) {
            where.rol = filtros.rol;
        }

        // Consultar los usuarios en la base de datos
        return await prisma.usuario.findMany({
            where,

            // Seleccionar únicamente los campos necesarios
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

    async activar(id: number) {

        const usuario = await this.obtenerPorId(id);

        if (!usuario) {
            throw AppError.notFound(`Usuario con ID ${id} no encontrado`);
        }

        return await prisma.usuario.update({
            where: { id },
            data: {
                estado: "ACTIVO"
            },
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                estado: true,
                rol: true,
                updateAt: true
            }
        });
    },

    async bloquear(id: number) {

        const usuario = await this.obtenerPorId(id);

        if (!usuario) {
            throw AppError.notFound(`Usuario con ID ${id} no encontrado`);
        }

        return await prisma.usuario.update({
            where: { id },
            data: {
                estado: "BLOQUEADO"
            },
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                estado: true,
                rol: true,
                updateAt: true
            }
        });
    },

    
    //Estos por el momento, no se utilizarán
    
    async crear(data: CreateUsuarioDto) {

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


    
}