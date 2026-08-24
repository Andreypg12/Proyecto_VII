import { Router } from "express";
import { HistorialCitaController } from "../controllers/historialCita.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class HistorialCitaRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new HistorialCitaController();

        router.get("/cita/:idCita", asyncHandler(controller.obtenerPorCita));

        return router;
    }
}
