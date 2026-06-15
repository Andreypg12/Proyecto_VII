import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { especialidadService } from "../services/especialidad.service";
import { sendSuccess } from "../utils/http-response";

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
    crear = async (request: Request, response: Response, next: NextFunction) => {
        const especialidad = await especialidadService.crear(request.body);
        return sendSuccess(
        response,
        especialidad,
        "especialidad creada correctamente",
        StatusCodes.CREATED
        );
    }
}