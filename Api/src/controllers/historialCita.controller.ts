import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { historialCitaService } from "../services/historialCita.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

export class HistorialCitaController {
    obtenerPorCita = async (request: Request, response: Response, next: NextFunction) => {
        const idCita = parseId(request.params.idCita);
        const historial = await historialCitaService.listarPorCita(idCita);
        return sendSuccess(
            response,
            historial,
            "Historial de la cita obtenido correctamente"
        );
    };
}
