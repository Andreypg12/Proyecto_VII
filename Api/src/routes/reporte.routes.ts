import { Router } from "express";

import { ReporteController } from "../controllers/reporte.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class ReporteRoutes {

    static get routes(): Router {

        const router = Router();
        const controller = new ReporteController();
        
        router.get("/citas-estado",asyncHandler(controller.citasPorEstado));
        router.get( "/citas-profesional", asyncHandler( controller.citasPorProfesional ));
        router.get( "/calificaciones", asyncHandler( controller.calificaciones ));
        return router;
    }
}