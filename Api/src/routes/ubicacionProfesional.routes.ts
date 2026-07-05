import { Router } from "express";
import { UbicacionProfesionalController } from "../controllers/ubicacionProfesional.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class UbicacionProfesionalRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new UbicacionProfesionalController()
        //Rutas
        //localhost:3000/UbicacionProfesional/
        router.get('/', asyncHandler(controller.listar))
        
        router.get('/:id', asyncHandler(controller.obtenerPorId))
        return router
    }
}
