import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { valoracionService } from "../services/valoracion.service";
import { createValoracionSchema } from "../dtos/valoracion.dto";
import { sendSuccess } from "../utils/http-response";
import { parseId } from "../utils/parse-id";
import { AuthRequest } from "../middlewares/auth.middleware";

export class ValoracionController {

    crearValoracion = async (request: AuthRequest, response: Response, next: NextFunction) => {
        try {
            const dto = createValoracionSchema.parse(request.body);
            const usuarioId = request.user!.id;
            const valoracion = await valoracionService.crear(dto, usuarioId);
            return sendSuccess(response, valoracion, "Valoración creada correctamente", StatusCodes.CREATED);
        } catch (error) {
            next(error);
        }
    };

    obtenerPorCita = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const idCita = parseId(request.params.idCita);
            const valoracion = await valoracionService.obtenerPorCita(idCita);
            return sendSuccess(response, valoracion, "Valoración obtenida correctamente");
        } catch (error) {
            next(error);
        }
    };
}
