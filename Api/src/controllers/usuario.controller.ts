import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { usuarioService } from "../services/usuario.service";

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
}