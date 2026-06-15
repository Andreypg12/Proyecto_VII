import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import { profesionalService } from '../services/profesional.service';

export class ProfesionalController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const profesionales = await profesionalService.listar();
            return response.status(StatusCodes.OK).json({
                success: true,
                data: profesionales,
            });
        } catch (error) {
            console.error(error);
            next(error);
        }
    };
}