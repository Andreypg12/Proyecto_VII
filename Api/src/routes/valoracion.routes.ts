import { Router } from "express";
import { ValoracionController } from "../controllers/valoracion.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";

export class ValoracionRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new ValoracionController();

        router.post("/", authenticateToken, asyncHandler(controller.crearValoracion));
        router.get("/cita/:idCita", asyncHandler(controller.obtenerPorCita));

        return router;
    }
}
