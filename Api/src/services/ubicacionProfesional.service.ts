import { prisma } from "../config/prisma";

export const ubicacionProfesional = {

    async listar() {
        return await prisma.ubicacionProfesional.findMany();
    },

    async obtenerPorId(id: number) {
        return await prisma.ubicacionProfesional.findUnique({
            where: { id }
        });
    }
};
