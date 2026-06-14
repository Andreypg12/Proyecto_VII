import { prisma } from "../config/prisma";

export const especialidadService = {

    async listar() {
        return await prisma.especialidad.findMany({
            orderBy: { especialidad: "asc" }
        });
    },
    async obtenerPorId(especialidadId: number) {
        return await prisma.especialidad.findFirst({
            where: {
                id: especialidadId
            }
        })
    },


}