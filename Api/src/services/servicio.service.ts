import { prisma } from "../config/prisma";

export const servicioService = {
    async listar() {
        return await prisma.servicio.findMany();
    },
};