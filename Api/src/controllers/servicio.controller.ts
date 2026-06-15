import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import { servicioService } from '../services/servicio.service';

export class ServicioController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const servicios = await servicioService.listar();
            return response.status(StatusCodes.OK).json({
                success: true,
                data: servicios,
            });
        } catch (error) {
            console.error(error);
            next(error);
        }
    };
}