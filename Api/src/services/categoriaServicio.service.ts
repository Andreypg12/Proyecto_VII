import { prisma } from "../config/prisma";

export const categoriaServicioService = {

    async listar() {
        return await prisma.categoriaServicio.findMany({
            orderBy: { categoria:"asc" }
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