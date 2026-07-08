import { Router } from "express";
import { citaController } from "../controllers/cita.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { createCitaSchema } from "../dtos/cita.dto";
import { validateRequest } from "../middlewares/validate-request.middleware";

export class CitaRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new citaController();

        // GET
        router.get(
            "/",
            asyncHandler(controller.listar)
        );

        // GET BY ID
        router.get(
            "/:id",
            asyncHandler(controller.obtenerPorId)
        );

        // POST
        router.post(
            "/",
            validateRequest(createCitaSchema),
            asyncHandler(controller.crear)
        );

        return router;
    }
}