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

        //Se obtienen los datos
        const rawId = Array.isArray(request.params.id) ? request.params[0] : request.params.id;
        const id = parseInt(rawId ?? '', 10);

        //Valida si es un numero, en caso que no sea un numero devuelve status code Bad request e ID Inválido
        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido"})
        }

        //Obtiene la especialidad por medio del servicio y valida que no sea null, Retorna Not found en caso que entre en la validación
        const especialidad = await especialidadService.obtenerPorId(id);
        if (!especialidad) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Especialidad no encontrada."})
        }

        //Respuesta correcta
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