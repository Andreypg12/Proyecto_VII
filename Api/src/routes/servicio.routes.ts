import { Router } from "express";
import { ServicioController } from "../controllers/servicio.controller";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { createServicioSchema, updateServicioSchema } from "../dtos/servicio.dto";

export class ServicioRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new ServicioController()
        //Rutas
        //locahost:3000/servicio/
        router.get('/', controller.listar)

        router.get('/:id', asyncHandler(controller.obtenerPorId))

        router.put('/cambiarEstado/:id', asyncHandler(controller.cambiarEstado))

        router.post(
            "/",
            validateRequest(createServicioSchema),
            asyncHandler(controller.crear)
        )

        router.put(
            "/:id",
            validateRequest(updateServicioSchema),
            asyncHandler(controller.actualizar)
        )

        return router
    }
}