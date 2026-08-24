import {
    Request,
    Response,
    NextFunction
} from "express";

import { reporteService } from "../services/reporte.service";
import { sendSuccess } from "../utils/http-response";
import { AppError } from "../utils/app-error";

export class ReporteController {

    //Reporte 1
    citasPorEstado = async ( request: Request, response: Response, next: NextFunction) => {
        const {
            fechaDesde,
            fechaHasta,
            idProfesional,
            idCategoria,
        } = request.query;

        let desde: Date | undefined;
        let hasta: Date | undefined;

        // Fecha desde
        if (fechaDesde) {
            desde = new Date( `${fechaDesde.toString()}T00:00:00`);
            if (Number.isNaN(desde.getTime())) {
                throw AppError.badRequest(
                    "La fecha desde no es válida"
                );
            }
        }

        // Fecha hasta
        if (fechaHasta) {
            hasta = new Date( `${fechaHasta.toString()}T23:59:59.999` );
            if (Number.isNaN(hasta.getTime())) {
                throw new Error(
                    "La fecha hasta no es válida"
                );
            }
        }

        // Validar rango
        if ( desde && hasta && desde > hasta) {
            throw new Error(
                "La fecha desde no puede ser mayor que la fecha hasta"
            );
        }

        // Profesional
        let profesional: number | undefined;
        if (idProfesional) {
            profesional = Number(idProfesional);
            if ( !Number.isInteger(profesional) ||profesional <= 0) {
                throw new Error(
                    "El profesional no es válido"
                );
            }
        }

        // Categoría
        let categoria: number | undefined;
        if (idCategoria) {
            categoria = Number(idCategoria);
            if ( !Number.isInteger(categoria) || categoria <= 0) {
                throw new Error(
                    "La categoría no es válida"
                );
            }
        }

        const reporte =
            await reporteService.citasPorEstado({
                fechaDesde: desde,
                fechaHasta: hasta,
                idProfesional: profesional,
                idCategoria: categoria,
            });

        return sendSuccess(
            response,
            reporte,
            "Reporte de citas por estado obtenido correctamente"
        );
    };

    //Reporte 2
    citasPorProfesional = async ( request: Request, response: Response, next: NextFunction) => {
        const { idProfesional } = request.query;
        let profesional: number | undefined;

        if (idProfesional) {

            profesional = Number(idProfesional);

            if ( !Number.isInteger(profesional) || profesional <= 0) {
                throw AppError.badRequest(
                    "El profesional no es válido"
                );
            }
        }

        const reporte = await reporteService .citasPorProfesional(profesional);

        return sendSuccess( response, reporte, "Reporte de citas por profesional obtenido correctamente");
    };


    //Reporte 3
    calificaciones = async ( request: Request, response: Response, next: NextFunction) => {

        const { idProfesional } = request.query;
        let profesional: number | undefined;

        if (idProfesional) {
            profesional = Number(idProfesional);

            if ( !Number.isInteger(profesional) || profesional <= 0) {
                throw AppError.badRequest(
                    "El profesional no es válido"
                );
            }
        }
        const reporte = await reporteService.calificaciones( profesional );
        return sendSuccess(
            response,
            reporte,
            "Reporte de calificaciones obtenido correctamente"
        );
    };
}