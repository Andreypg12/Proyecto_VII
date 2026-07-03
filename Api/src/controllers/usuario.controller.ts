import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { usuarioService } from "../services/usuario.service";
import { success } from "zod";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";
import { Rol } from "../../generated/prisma/enums";

export class usuarioController {
    listar = async (req: Request, res: Response, next: NextFunction) => {
        try {

            //as Rol es para castear el valor porque claramente es un Rol
            const buscar = req.query.buscar as string | undefined;
            const rol = req.query.rol as Rol | undefined;

            //Si existe un rol dentro de la variable pero que no está dentro del enum 
            if (rol && !Object.values(Rol).includes(rol)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Rol inválido"
                });
            }


            const usuarios = await usuarioService.listar({
                buscar,
                rol
            });

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

    crear = async (request: Request, response: Response, next: NextFunction) => {
        const usuario = await usuarioService.crear(request.body);

        return sendSuccess(
            response,
            usuario,
            "Usuario creado correctamente",
            StatusCodes.CREATED
        );
    };

    actualizar = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const usuario = await usuarioService.actualizar(id, request.body);

        return sendSuccess(
            response,
            usuario,
            "Usuario actualizado correctamente"
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

    bloquear = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);

        const usuario = await usuarioService.bloquear(id);

        return sendSuccess(
            response,
            usuario,
            "Usuario bloqueado correctamente"
        );
    };

}