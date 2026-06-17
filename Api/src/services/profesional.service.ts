import { Rol } from "../../generated/prisma/enums";
import { prisma } from "../config/prisma";
import { CreateProfesionalDto } from "../dtos/profesional.dto";
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
    async crear(data: CreateProfesionalDto) {
        // // // await this.validateCategoria(data.categoriaId)
        //[3,4]
        if (data.etiquetaIds?.length) {
            await this.validateEtiquetas(data.etiquetaIds)
        }
        if (data.plataformas?.length) {
            await this.validatePlataformas(
                data.plataformas.map((item) => item.plataformaId)
            )
        }
        prisma.usuario.create({
            data: {
                email: data.usuario.email,
                nombre: data.usuario.nombre,
                apellidos: data.usuario.apellidos,
                password: data.usuario.password,
                rol: Rol.PROFESIONAL
            }
        })

        return prisma.perfilProfesional.create({
            data: {
                titulo: data.titulo,
                descripcion: data.descripcion,
                tarifa_por_hora: data.tarifa_por_hora,
                annos_experiencia: data.annos_experiencia,
                imagen_profesional: data.imagen_profesional ?? "image-not-found.jpg",
                disponibilidad: data.disponibilidad ?? true,
                modalidad: data.modalidad,
                etiquetas: data.etiquetaIds //[1,2]
                    ? { //[{id: 1},{id: 2}]
                        connect: data.etiquetaIds.map((id) => ({ id })),
                    }
                    : undefined,
                plataformas: data.plataformas
                    ? {
                        create: data.plataformas.map((item) => ({
                            plataformaId: item.plataformaId,
                            annoLanzamiento: item.annoLanzamiento,
                        })),
                    }
                    : undefined,
            },
            include: {
                categoria: true,
                etiquetas: true,
                plataformas: {
                    include: {
                        plataforma: true,
                    },
                },
            },
        });

    },
};