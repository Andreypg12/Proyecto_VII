import { Router } from "express";
import { usuarioController } from "../controllers/usuario.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class usuarioRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new usuarioController()
        //Rutas
        //localhost:3000/usuario/
        router.get('/', asyncHandler(controller.listar))
        return router
    }
}