import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { citaService } from "../services/cita.service";
import { parseId } from "../utils/parse-id";
import { sendSuccess } from "../utils/http-response";

import { EstadoCita } from "../../generated/prisma/enums";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Rol } from "../../generated/prisma/enums";

export class citaController {

    listar = async (
        request: AuthRequest,
        response: Response,
        next: NextFunction
    ) => {

        // Usuario obtenido del JWT por authenticateToken
        const usuarioAutenticado = request.user;

        if (!usuarioAutenticado) {
            return response
                .status(StatusCodes.UNAUTHORIZED)
                .json({
                    success: false,
                    message: "Usuario no autenticado",
                });
        }


        // Obtener filtros enviados por query params
        const estado =
            request.query.estado as EstadoCita | undefined;

        const idProfesionalParam =
            request.query.idProfesional as string | undefined;

        const fechaDesde =
            request.query.fechaDesde as string | undefined;

        const fechaHasta =
            request.query.fechaHasta as string | undefined;


        // Validar estado
        if (
            estado &&
            !Object.values(EstadoCita).includes(estado)
        ) {
            return response
                .status(StatusCodes.BAD_REQUEST)
                .json({
                    success: false,
                    message: "El estado de la cita no es válido",
                });
        }


        // Validar profesional
        let idProfesional: number | undefined;

        if (idProfesionalParam) {

            idProfesional =
                Number(idProfesionalParam);

            if (
                !Number.isInteger(idProfesional) ||
                idProfesional <= 0
            ) {
                return response
                    .status(StatusCodes.BAD_REQUEST)
                    .json({
                        success: false,
                        message:
                            "El profesional seleccionado no es válido",
                    });
            }
        }


        // Validar formato AAAA-MM-DD
        const formatoFecha =
            /^\d{4}-\d{2}-\d{2}$/;


        if (
            fechaDesde &&
            !formatoFecha.test(fechaDesde)
        ) {
            return response
                .status(StatusCodes.BAD_REQUEST)
                .json({
                    success: false,
                    message:
                        "La fecha inicial no es válida",
                });
        }


        if (
            fechaHasta &&
            !formatoFecha.test(fechaHasta)
        ) {
            return response
                .status(StatusCodes.BAD_REQUEST)
                .json({
                    success: false,
                    message:
                        "La fecha final no es válida",
                });
        }


        // Validar rango de fechas
        if (
            fechaDesde &&
            fechaHasta &&
            fechaDesde > fechaHasta
        ) {
            return response
                .status(StatusCodes.BAD_REQUEST)
                .json({
                    success: false,
                    message:
                        "La fecha inicial no puede ser posterior a la fecha final",
                });
        }


        // Llamada al servicio:
        // enviamos filtros + usuario autenticado
        const citas =
            await citaService.listar(
                {
                    estado,
                    idProfesional,
                    fechaDesde,
                    fechaHasta,
                },
                usuarioAutenticado
            );


        // Respuesta exitosa
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


    crear = async ( request: AuthRequest, response: Response, next: NextFunction) => {

        const usuarioAutenticado = request.user;
        
        if (!usuarioAutenticado) {
            return response
                .status(StatusCodes.UNAUTHORIZED)
                .json({
                    success: false,
                    message: "Usuario no autenticado"
                });
        }

        let datosCita = request.body;

        // Si quien registra es CLIENTE,
        // el cliente de la cita será él mismo.
        if (usuarioAutenticado.rol === Rol.CLIENTE ) {

            datosCita = {
                ...request.body,

                id_cliente:
                    usuarioAutenticado.id
            };

        }

        const cita = await citaService.crear( datosCita );

        return sendSuccess(
            response,
            cita,
            "Cita registrada correctamente",
            StatusCodes.CREATED
        );

    };

    async obtenerConfiguracion(req: Request, res: Response) {
        const configuracion = await citaService.obtenerConfiguracion();

        res.status(200).json({
            success: true,
            data: configuracion
        });
    }


    cambiarEstado = async ( request: AuthRequest, response: Response, next: NextFunction) => {

        const usuarioAutenticado = request.user;

        if (!usuarioAutenticado) {
            return response
                .status(StatusCodes.UNAUTHORIZED)
                .json({
                    success: false,
                    message: "Usuario no autenticado",
                });
        }

        // Obtiene y valida el identificador de la cita
        const id = parseId( request.params.id);

        // El service recibe el usuario completo
        // para validar rol + pertenencia de la cita
        const cita =
            await citaService.cambiarEstado(
                id,
                request.body,
                usuarioAutenticado
            );

        return sendSuccess(
            response,
            cita,
            "Estado de la cita actualizado correctamente"
        );
    };
}