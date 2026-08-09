import { Router } from "express";
import { citaController } from "../controllers/cita.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { cambiarEstadoCitaSchema, createCitaSchema } from "../dtos/cita.dto";
import { validateRequest } from "../middlewares/validate-request.middleware";

export class CitaRoutes {

    static get routes(): Router {

        const router = Router();
        const controller = new citaController();

        // GET CONFIGURACIÓN
        router.get("/configuracion", asyncHandler(controller.obtenerConfiguracion));

        // GET LISTADO
        router.get("/", asyncHandler(controller.listar));

        // POST CREAR CITA
        router.post("/", validateRequest(createCitaSchema), asyncHandler(controller.crear));

        // PATCH CAMBIAR ESTADO
        router.patch("/:id/estado", validateRequest(cambiarEstadoCitaSchema), asyncHandler(controller.cambiarEstado));

        // GET CITA POR ID
        router.get("/:id", asyncHandler(controller.obtenerPorId));

        return router;
    }
}