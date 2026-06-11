import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { especialidadService } from "../services/especialidad.service";

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
}