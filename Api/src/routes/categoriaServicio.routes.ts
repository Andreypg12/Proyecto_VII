import { Router } from "express";
import { categoriaServicioController } from "../controllers/categoriaServicio.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { createCategoriaServicioSchema, updateCategoriaServicioSchema } from "../dtos/categoriaServicio.dto";
import { validateRequest } from "../middlewares/validate-request.middleware";

export class CategoriaServicioRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new categoriaServicioController()
        //Rutas
        //localhost:3000/categoriaServicio/
        router.get('/', asyncHandler(controller.listar))
        
        router.get('/:id', asyncHandler(controller.obtenerPorId))
        
        router.post("/", validateRequest(createCategoriaServicioSchema), asyncHandler(controller.crear))
        router.put("/:id", validateRequest(updateCategoriaServicioSchema), asyncHandler(controller.actualizar))

        return router
    }
}
