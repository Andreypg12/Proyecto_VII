import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import { ServicioFilters, servicioService } from '../services/servicio.service';
import { AppError } from '../utils/app-error';
import { sendSuccess } from '../utils/http-response';
import { parseId } from '../utils/parse-id';

export class ServicioController {
    async listar(req: Request, res: Response) {
        try {
            const {
                nombre,
                categoria,
                modalidad,
                precio_min,
                precio_max,
                pagina,
                limite,
                orderBy,
                orderDir
            } = req.query;

            const filtros: ServicioFilters = {};

            if (nombre) filtros.nombre = nombre as string;
            if (categoria) filtros.categoria = categoria as string;
            if (modalidad) filtros.modalidad = modalidad as string;
            if (precio_min) filtros.precio_min = Number(precio_min);
            if (precio_max) filtros.precio_max = Number(precio_max);
            if (pagina) filtros.pagina = Number(pagina);
            if (limite) filtros.limite = Number(limite);
            if (orderBy) filtros.orderBy = orderBy as any;
            if (orderDir) filtros.orderDir = orderDir as any;

            const result = await servicioService.listar(filtros);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            console.error('Error en listar servicios:', error);

            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Error al listar servicios'
                });
            }
        }
    };
    
    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        //Nullish Coalescing (??)
        const rawId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        const id = parseInt(rawId ?? '', 10);
        if (isNaN(id)) {
            return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" });
        }
        const servicio = await servicioService.obtenerPorId(id);
        if (!servicio) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Servicio no encontrado" });
        }
        return response.status(StatusCodes.OK).json({ success: true, data: servicio });
    };

    crear = async (request: Request, response: Response, next: NextFunction) => {
        const servicio = await servicioService.crear(request.body);
        return sendSuccess(
            response,
            servicio,
            "Servicio creado correctamente",
            StatusCodes.CREATED
        );
    };

    actualizar = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const servicio = await servicioService.actualizar(id, request.body);
        return sendSuccess(
            response,
            servicio,
            "Servicio actualizado correctamente"
        );
    };
}