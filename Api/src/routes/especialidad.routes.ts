import { Router } from "express";
import { especialidadController } from "../controllers/especialidad.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class especialidadRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new especialidadController()
        //Rutas
        //localhost:3000/especialidad/
        router.get('/', asyncHandler(controller.listar))
        return router
    }
}