import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { citaService } from "../services/cita.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

import { EstadoCita } from "../../generated/prisma/enums";

export class citaController {

    listar = async (request: Request, response: Response, next: NextFunction) => {

        const estado = request.query.estado as EstadoCita | undefined;
        const idProfesionalParam = request.query.idProfesional as string | undefined;
        const fechaDesde = request.query.fechaDesde as string | undefined;
        const fechaHasta = request.query.fechaHasta as string | undefined;


        // Validar estado
        if (estado && !Object.values(EstadoCita).includes(estado)) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "El estado de la cita no es válido",
            });
        }

        // Validar profesional
        let idProfesional: number | undefined;

        if (idProfesionalParam) {
            idProfesional = Number(idProfesionalParam);

            if (!Number.isInteger(idProfesional) || idProfesional <= 0) {

                return response.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "El profesional seleccionado no es válido",
                });
            }
        }

        // Validar formato de fechas   Exige el formato AAAA-MM-DD
        const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

        //Si se recibió fechaDesde, pero no tiene el formato esperado, responde con error
        if (fechaDesde && !formatoFecha.test(fechaDesde)) {

            return response.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "La fecha inicial no es válida",
            });
        }

        //Si se recibió fechaHasta, pero no tiene el formato esperado, responde con error
        if (fechaHasta && !formatoFecha.test(fechaHasta)) {
            return response.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "La fecha final no es válida",
            });
        }

        // Validar rango
        //Comprueba que la fecha inicial no sea posterior a la final.
        if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {

            return response.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message:
                    "La fecha inicial no puede ser posterior a la fecha final",
            });
        }

        //Llamada al servicio para listar
        const citas = await citaService.listar({
            estado,
            idProfesional,
            fechaDesde,
            fechaHasta,
        });


        //Respuesta exitosa del listado
        return sendSuccess(
            response,
            citas,
            "Citas obtenidas correctamente"
        );
    };


    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {

        //Convierte el id por medio del parseId que se encuentra en utils
        const id = parseId(request.params.id);
        //Obtiene la cita por medio del id
        const cita = await citaService.obtenerPorId(id);

        if (!cita) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Cita no encontrada",
            });
        }

        return sendSuccess(response, cita, "Cita obtenida correctamente");
    };


    crear = async (request: Request, response: Response, next: NextFunction) => {

        const cita = await citaService.crear(request.body);

        return sendSuccess(
            response,
            cita,
            "Cita registrada correctamente",
            StatusCodes.CREATED
        );
    };

    async obtenerConfiguracion(req: Request,res: Response) {
        const configuracion = await citaService.obtenerConfiguracion();

        res.status(200).json({
            success: true,
            data: configuracion
        });
    }
}