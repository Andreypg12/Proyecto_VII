import { Router } from "express";
import { usuarioController } from "../controllers/usuario.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { createUsuarioSchema, updateUsuarioSchema } from "../dtos/usuario.dto";
import { validateRequest } from "../middlewares/validate-request.middleware";

export class UsuarioRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new usuarioController();

        // GET
        router.get('/', asyncHandler(controller.listar));
        router.get('/config',asyncHandler(controller.obtenerConfiguracion));
        router.get('/:id', asyncHandler(controller.obtenerPorId));

        // POST / PUT
        router.post("/",validateRequest(createUsuarioSchema),asyncHandler(controller.crear));
        router.put( "/:id", validateRequest(updateUsuarioSchema), asyncHandler(controller.actualizar));

        // CAMBIO DE ESTADO
        router.put('/activar/:id', asyncHandler(controller.activar));
        router.put('/bloquear/:id', asyncHandler(controller.bloquear));

        return router;
    }
}