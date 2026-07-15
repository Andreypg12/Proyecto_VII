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

            // Se realiza una afirmación de tipo para tratar el query param
            // como un Rol o undefined. Después se valida realmente contra el enum.
            const buscar = req.query.buscar as string | undefined;
            const rol = req.query.rol as Rol | undefined;

            // Si se recibió un rol y no pertenece
            // a los valores permitidos del enum, responder 400.
            if (rol && !Object.values(Rol).includes(rol)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Rol inválido"
                });
            }

            // Enviar los filtros al servicio.
            // await espera el resultado de la consulta.
            const usuarios = await usuarioService.listar({
                buscar,
                rol
            });

             // Responder 200 con los usuarios encontrados.
            return res.status(StatusCodes.OK).json({
                success: true,
                data: usuarios,
            });

        } catch (error) {
            // Registrar el error en la terminal.
            console.error(error);

            // Enviar el error al middleware global.
            next(error);
        }
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        // Obtener el ID enviado como parámetro en la URL, valida si viene en array o sino lo agarra normal
        const rawId = Array.isArray(request.params.id)
        ? request.params.id[0]
        : request.params.id;

        // Convertir el ID de texto a número entero
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
    };

    

    activar = async (request: Request, response: Response, next: NextFunction) => {

        // Obtener y convertir el ID enviado en la ruta
        const id = parseId(request.params.id);

        // Activar el usuario mediante el servicio
        const usuario = await usuarioService.activar(id);

        // Enviar respuesta exitosa
        return sendSuccess(
            response,
            usuario,
            "Usuario activado correctamente"
        );
    };

    bloquear = async (request: Request, response: Response, next: NextFunction) => {

        // Obtener y convertir el ID enviado en la ruta
        const id = parseId(request.params.id);

         // Bloquear el usuario mediante el servicio
        const usuario = await usuarioService.bloquear(id);

        // Enviar respuesta exitosa
        return sendSuccess(
            response,
            usuario,
            "Usuario bloqueado correctamente"
        );
    };



    //Por el momento no se usan
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
}