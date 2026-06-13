import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { categoriaServicioService } from "../services/categoriaServicio.service";

export class categoriaServicioController {
    listar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categorias = await categoriaServicioService.listar();
            return res.status(StatusCodes.OK).json({
                success: true,
                data: categorias,
            });
        } catch (error) {
            console.error(error);
            next(error);
        }
    };
}