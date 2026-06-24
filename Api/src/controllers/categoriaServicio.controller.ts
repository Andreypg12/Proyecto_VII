import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { categoriaServicioService } from "../services/categoriaServicio.service";
import { success } from "zod";
import { especialidadService } from "../services/especialidad.service";

export class categoriaServicioController {
    listar = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const buscar = req.query.buscar as string | undefined;
            const estado = req.query.estado as string | undefined;

            const estadoParam = req.query.estado as string | undefined;

            if (
                estadoParam !== undefined &&
                estadoParam !== "true" &&
                estadoParam !== "false"
            ) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Estado inválido. Use true o false."
                });
            }

            const categorias = await categoriaServicioService.listar({
                buscar,
                estado: estado !== undefined ? estado === "true" : undefined
            });

            return res.status(StatusCodes.OK).json({
                success: true,
                data: categorias,
            });

        } catch (error) {
            console.error(error);
            next(error);
        }
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) =>{
        try {
            //Se obtienen los datos
            const rawId = Array.isArray(request.params.id) ? request.params[0] : request.params.id;
            const id = parseInt(rawId ?? '', 10);

            //Valida si es un numero, en caso que no sea un numero devuelve status code Bad request e ID Inválido
            if (isNaN(id)) {
                return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido"})
            }

            //Obtiene la categoría del servicio por medio del servicio y valida que no sea null, Retorna Not found en caso que entre en la validación
            const categoriaServicio = await especialidadService.obtenerPorId(id);
            if (!categoriaServicio) {
            return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Categoría no encontrada."})
            }

            //Respuesta correcta
            return response.status(StatusCodes.OK).json({ success: true, data: categoriaServicio});
            
        } catch (error) {
            console.error(error);
            next(error)
        }
    }
}