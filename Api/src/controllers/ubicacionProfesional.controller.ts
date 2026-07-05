import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import { ubicacionProfesional } from '../services/ubicacionProfesional.service';

export class UbicacionProfesionalController {
    listar = async (request: Request, response: Response, next: NextFunction) => {

        const resultado = await ubicacionProfesional.listar();
        return response.status(StatusCodes.OK).json({
            success: true,
            data: resultado,
        });

    };
    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {

        const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        const id = parseInt(rawId ?? '', 10);
        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" });
        }

        const etiqueta = await ubicacionProfesional.obtenerPorId(id);
        if (!etiqueta) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Ubicación no encontrada" });
        }

        return response.status(StatusCodes.OK).json({ success: true, data: etiqueta });

    };
}
