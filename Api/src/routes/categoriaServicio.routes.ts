import { Router } from "express";
import { categoriaServicioController } from "../controllers/categoriaServicio.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class CategoriaServicioRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new categoriaServicioController()
        //Rutas
        //localhost:3000/categoriaServicio/
        router.get('/', asyncHandler(controller.listar))
        return router
    }
}