import { Router } from "express";
import { especialidadController } from "../controllers/especialidad.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { createEspecialidadSchema } from "../dtos/especialidad.dto";

export class EspecialidadRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new especialidadController()
        //Rutas
        //localhost:3000/especialidad/
        router.get('/', asyncHandler(controller.listar))
        router.post(
            "/",
            validateRequest(createEspecialidadSchema),
            asyncHandler(controller.crear)
        )
        return router
    }
}