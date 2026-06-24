import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { usuarioService } from "../services/usuario.service";
import { success } from "zod";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

export class usuarioController {
    listar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const usuarios = await usuarioService.listar();
            return res.status(StatusCodes.OK).json({
                success: true,
                data: usuarios,
            });
        } catch (error) {
            console.error(error);
            next(error);
        }
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        try {
            //Se obtienen los datos
            const rawId = Array.isArray(request.params.id) ? request.params[0] : request.params.id;
            const id = parseInt(rawId ?? '', 10);

            //Valida si es un numero, en caso que no sea un numero devuelve status code Bad request e ID Inválido
            if (isNaN(id)) {
                return response.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "ID inválido" })
            }

            //Obtiene el usuario por medio del servicio y valida que no sea null, Retorna Not found en caso que entre en la validación
            const usuario = await usuarioService.obtenerPorId(id);
            if (!usuario) {
                return response.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Usuario no encontrado." })
            }

            //Respuesta correcta
            return response.status(StatusCodes.OK).json({ success: true, data: usuario })

        } catch (error) {
            console.error(error);
            next(error);
        }
    };

    bloquear = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const usuario = await usuarioService.bloquear(id);
        return sendSuccess(
            response,
            usuario,
            "Usuario bloqueado correctamente"
        );
    };

    activar = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const usuario = await usuarioService.activar(id);
        return sendSuccess(
            response,
            usuario,
            "Usuario activado correctamente"
        );
    };
}