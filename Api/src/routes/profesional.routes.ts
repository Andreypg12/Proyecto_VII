import { Router } from "express";
import { ProfesionalController } from "../controllers/profesional.controller";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createProfesionalSchema, updateProfesionalSchema } from "../dtos/profesional.dto";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class ProfesionalRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new ProfesionalController()
        //Rutas
        //  locahost:3000/profesional/
        router.get('/', asyncHandler(controller.listar))

        //  locahost:3000/profesional/1
        router.get('/:id', asyncHandler(controller.obtenerPorId))

        router.put('/cambiarDisponibilidad/:id', asyncHandler(controller.cambiarDisponibilidad))


        router.post(
            "/",
            validateRequest(createProfesionalSchema),
            asyncHandler(controller.crear)
        )

        router.put(
            "/:id",
            validateRequest(updateProfesionalSchema),
            asyncHandler(controller.actualizar)
        )
        return router
    }
}