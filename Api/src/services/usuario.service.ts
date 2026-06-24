import { prisma } from "../config/prisma";

export const usuarioService = {

    async listar() {
        return await prisma.usuario.findMany({
            orderBy: { id: "asc" }
        });
    },
    async obtenerPorId(usuarioId: number) {
        return await prisma.usuario.findFirst({
            where: {
                id: usuarioId
            }
        })
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