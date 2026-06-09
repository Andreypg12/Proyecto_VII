import { Router } from "express";
import { especialidadRoutes } from "./especialidad.routes";

export class AppRoutes {
    static get routes(): Router {
        const router = Router();
        // --Agregar las rutas--
        router.use('/especialidad', especialidadRoutes.routes)
        return router;
    }
}