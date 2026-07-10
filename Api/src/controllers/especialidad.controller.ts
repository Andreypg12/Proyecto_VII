import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { especialidadService } from "../services/especialidad.service";
import { sendSuccess } from "../utils/http-response";
import { prisma } from "../config/prisma";
import { array, success } from "zod";
import { parseId } from "../utils/parse-id";

export class especialidadController {

    //Request es lo que recibo que manda el usuario
    //Responso lo uso para enviarle datos y que los vea el usuario
    listar = async (req: Request, res: Response, next: NextFunction) => {
        const buscar = req.query.buscar as string | undefined;
        const estado = req.query.estado as string | undefined;

        if (estado !== undefined && estado !== "true" && estado !== "false") {
            
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Estado inválido. Use true o false."
            });
        }


        const especialidades = await especialidadService.listar({
            buscar,
            estado: estado !== undefined ? estado === "true" : undefined
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            data: especialidades,
        });
    };

    //Request es lo que recibo que manda el usuario
    //Responso lo uso para enviarle datos y que los vea el usuario
    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {

        //Se obtienen los datos
        const rawId = Array.isArray(request.params.id) ? request.params[0] : request.params.id;
        const id = parseInt(rawId ?? '', 10);

        //Valida si es un numero, en caso que no sea un numero devuelve status code Bad request e ID Inválido
        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" })
        }

        //Obtiene la especialidad por medio del servicio y valida que no sea null, Retorna Not found en caso que entre en la validación
        const especialidad = await especialidadService.obtenerPorId(id);
        if (!especialidad) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Especialidad no encontrada." })
        }

        //Respuesta correcta
        return response.status(StatusCodes.OK).json({ success: true, data: especialidad });

    }

    //Request es lo que recibo que manda el usuario
    //Responso lo uso para enviarle datos y que los vea el usuario
    crear = async (request: Request, response: Response, next: NextFunction) => {
        const especialidad = await especialidadService.crear(request.body);
        return sendSuccess(
            response,
            especialidad,
            "especialidad creada correctamente",
            StatusCodes.CREATED
        );
    };

    actualizar = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const especialidad = await especialidadService.actualizar(id, request.body);
        return sendSuccess(
            response,
            especialidad,
            "especialidad actualizada correctamente",
        );
    };

    activar = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);

        const especialidad = await especialidadService.activar(id);

        if (!especialidad) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Especialidad no encontrada",
            });
        }

        return sendSuccess(
            response,
            especialidad,
            "Especialidad activada correctamente"
        );
    };

    desactivar = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);

        const especialidad = await especialidadService.desactivar(id);

        if (!especialidad) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Especialidad no encontrada",
            });
        }

        return sendSuccess(
            response,
            especialidad,
            "Especialidad desactivada correctamente"
        );
    };



}