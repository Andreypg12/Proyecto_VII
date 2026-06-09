import { Request, Response, NextFunction, response } from 'express';
import { StatusCodes } from "http-status-codes";
import { especialidadService } from '../services/especialidad.service';

export class especialidadController {
    listar = async (request: Request, Response: Response, next: NextFunction) => {
        try {
            
            const especialidad = await especialidadService.listar();

            return response.status(StatusCodes.OK).json({
                success: true,
                data: especialidad,
            });

            
        } catch (error) {
            console.error(error);
            next(error);
        }
    }

}