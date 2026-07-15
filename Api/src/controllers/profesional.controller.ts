import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import { ProfesionalFilters, profesionalService } from '../services/profesional.service';
import { sendSuccess } from '../utils/http-response';
import { parseId } from '../utils/parse-id';
import { AppError } from '../utils/app-error';

export class ProfesionalController {

    async listar(req: Request, res: Response) {

        const { nombre, modalidad, disponibilidad, pagina, limite } = req.query;

        const filtros = {
            nombre: nombre as string,
            modalidad: modalidad as string,
            disponibilidad: disponibilidad !== undefined ? disponibilidad === 'true' : undefined,
            pagina: pagina ? Number(pagina) : undefined,
            limite: limite ? Number(limite) : undefined
        };

        const result = await profesionalService.listar(filtros);
        res.json({
            success: true,
            ...result
        });
    }

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        //Nullish Coalescing (??)
        const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        const id = parseInt(rawId ?? '', 10);
        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" });
        }
        const profesional = await profesionalService.obtenerPorId(id);
        if (!profesional) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Profesional no encontrado" });
        }
        return response.status(StatusCodes.OK).json({ success: true, data: profesional });
    };

    crear = async (request: Request, response: Response, next: NextFunction) => {
        const profesional = await profesionalService.crear(request.body);
        return sendSuccess(
            response,
            profesional,
            "Profesional creado correctamente",
            StatusCodes.CREATED
        );
    };

    actualizar = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const profesional = await profesionalService.actualizar(id, request.body);
        return sendSuccess(
            response,
            profesional,
            "Profesional actualizado correctamente"
        );
    };

    cambiarDisponibilidad = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const profesional = await profesionalService.cambiarDisponibilidad(id);
        return sendSuccess(
            response,
            profesional,
            "Cambio de disponibilidad completado"
        );
    };
}