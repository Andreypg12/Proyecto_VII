import { prisma } from "../config/prisma";
export const profesionalService = {
    async listar() {
        return await prisma.perfilProfesional.findMany(
            {
                select: {
                    id: true,
                    titulo: true,
                    descripcion: true,
                    tarifa_por_hora: true,
                    annos_experiencia: true,
                    imagen_profesional: true,
                    disponibilidad: true,
                    modalidad: true,
                    usuario: true,
                    servicios: true
                }
            }
        );
    },
};