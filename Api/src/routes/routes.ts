import { Router } from "express";
import { EspecialidadRoutes } from "./especialidad.routes";
import { CategoriaServicioRoutes } from "./categoriaServicio.routes";
import { UsuarioRoutes } from "./usuario.routes";
import { ProfesionalRoutes } from "./profesional.routes";
import { ServicioRoutes } from "./servicio.routes";

export class AppRoutes {
    static get routes(): Router {
        const router = Router();
        // --Agregar las rutas--
        router.use('/especialidad', EspecialidadRoutes.routes)
        router.use('/categoriaServicio', CategoriaServicioRoutes.routes)
        router.use('/usuario', UsuarioRoutes.routes)
        router.use('/profesional', ProfesionalRoutes.routes)
        router.use('/servicio', ServicioRoutes.routes)
        return router;
    }
}