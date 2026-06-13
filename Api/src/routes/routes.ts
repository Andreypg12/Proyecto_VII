import { Router } from "express";
import { especialidadRoutes } from "./especialidad.routes";
import { categoriaServicioService } from "../services/categoriaServicio.service";
import { categoriaServicioRoutes } from "./categoriaServicio.routes";
import { usuarioRoutes } from "./usuario.routes";

export class AppRoutes {
    static get routes(): Router {
        const router = Router();
        // --Agregar las rutas--
        router.use('/especialidad', especialidadRoutes.routes)
        router.use('/categoriaServicio', categoriaServicioRoutes.routes)
        router.use('/usuario', usuarioRoutes.routes)
        return router;
    }
}