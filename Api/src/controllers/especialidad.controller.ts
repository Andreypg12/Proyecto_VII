import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { especialidadService } from "../services/especialidad.service";
import { sendSuccess } from "../utils/http-response";
import { prisma } from "../config/prisma";
import { array, success } from "zod";

export class especialidadController {
    listar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const especialidades = await especialidadService.listar();
            return res.status(StatusCodes.OK).json({
                success: true,
                data: especialidades,
            });
        } catch (error) {
            console.error(error);
            next(error);
        }
    };

    obtenerPorId = async (request: Request, response: Response, next:NextFunction) => {

        const rawId = Array.isArray(request.params.id) ? request.params[0] : request.params.id;
        const id = parseInt(rawId ?? '', 10);

        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido"})
        }

        const especialidad = await especialidadService.obtenerPorId(id);
        if (!especialidad) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Especialidad no encontrada."})
        }

        return response.status(StatusCodes.OK).json({ success: true, data: especialidad});

    }

    crear = async (request: Request, response: Response, next: NextFunction) => {
        const especialidad = await especialidadService.crear(request.body);
        return sendSuccess(
        response,
        especialidad,
        "especialidad creada correctamente",
        StatusCodes.CREATED
        );
    };

    

}