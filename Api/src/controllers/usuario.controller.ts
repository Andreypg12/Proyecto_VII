import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { usuarioService } from "../services/usuario.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";
import { Rol } from "../../generated/prisma/enums";

export class usuarioController {

    //Obtener Configuración
    obtenerConfiguracion = async (request: Request, response: Response, next: NextFunction) => {
        const configuracion =
            await usuarioService.obtenerConfiguracion();

        return sendSuccess(
            response,
            configuracion,
            'Configuración de usuarios obtenida correctamente'
        );
    };

    //Listar
    listar = async (request: Request, response: Response, next: NextFunction) => {

        const buscar = request.query.buscar as string | undefined;
        const rol = request.query.rol as Rol | undefined;

        if (rol && !Object.values(Rol).includes(rol)) {

            return response.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message:
                    "Rol inválido"
            });
        }

        const usuarios = await usuarioService.listar({ buscar, rol });

        return response.status(StatusCodes.OK).json({
            success: true,
            data: usuarios,
        });
    };

    //Obtener por ID
    obtenerPorId = async (request: Request,response: Response,next: NextFunction) => {

        const id = parseId(request.params.id);

        const usuario =await usuarioService.obtenerPorId(id);
        if (!usuario) {
            return response
                .status(StatusCodes.NOT_FOUND)
                .json({

                    success: false,

                    message:
                        "Usuario no encontrado."
                });
        }

        return response.status(StatusCodes.OK).json({
                success: true,
                data: usuario
            });
    };

      // Registrar
        registrar = async (request: Request,response: Response,next: NextFunction) => {

                try {
                    const usuario = await usuarioService.registrar(request.body);

                    return sendSuccess(
                        response,
                        usuario,
                        "Usuario registrado correctamente",
                        StatusCodes.CREATED
                    );

                } catch (error) {

                    const message =
                        error instanceof Error
                            ? error.message
                            : "";

                    if (message ==="El correo ya está registrado") {

                        return response.status(StatusCodes.CONFLICT).json({
                                success: false,
                                message:
                                    "El correo ya está registrado"
                            });
                    }
                    next(error);
                }
            };


        //Login
        login = async (request: Request,response: Response,next: NextFunction) => {

        try {
            const resultado = await usuarioService.login(request.body);

            return sendSuccess(
                response,
                resultado,
                "Inicio de sesión correcto"
            );

        } catch (error) {

            const message =
                error instanceof Error
                    ? error.message
                    : "Credenciales incorrectas";


            if (message ==="Correo o contraseña incorrectos" || message === "El usuario se encuentra bloqueado") {

                return response.status(StatusCodes.UNAUTHORIZED).json({
                        success: false,
                        message:
                            "Credenciales incorrectas"
                    });
            }
            next(error);
        }
    };

    //Activar
    activar = async (request: Request, response: Response, next: NextFunction) => {

        const id = parseId(request.params.id);
        const usuario = await usuarioService.activar(id);

        return sendSuccess(
            response,
            usuario,
            "Usuario activado correctamente"
        );
    };

    //Bloquear
    bloquear = async (request: Request, response: Response, next: NextFunction) => {

        const id = parseId(request.params.id);
        const usuario = await usuarioService.bloquear(id);

        return sendSuccess(
            response,
            usuario,
            "Usuario bloqueado correctamente"
        );
    };



    //Crear
    crear = async (request: Request, response: Response, next: NextFunction) => {
        const usuario = await usuarioService.crear(request.body);

        return sendSuccess(
            response,
            usuario,
            "Usuario creado correctamente",
            StatusCodes.CREATED
        );
    };

    //Actualizar
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