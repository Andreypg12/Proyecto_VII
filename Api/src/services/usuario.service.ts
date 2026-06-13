import { prisma } from "../config/prisma";

export const usuarioService = {

    async listar() {
        return await prisma.usuario.findMany({
            orderBy: { id:"asc" }
        });
    },
    async obtenerPorId(usuarioId: number) {
        return await prisma.usuario.findFirst({
            where: {
                id: usuarioId
            }
        })
    }

}