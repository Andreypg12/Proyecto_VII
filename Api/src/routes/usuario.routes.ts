import { Router } from "express";
import { usuarioController } from "../controllers/usuario.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class UsuarioRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new usuarioController()
        //Rutas
        //localhost:3000/usuario/
        router.get('/', asyncHandler(controller.listar))
        router.get('/:id', asyncHandler(controller.obtenerPorId))
        return router
    }
}