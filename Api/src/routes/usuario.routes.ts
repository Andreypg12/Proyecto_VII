import { Router } from "express";
import { usuarioController } from "../controllers/usuario.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { createUsuarioSchema, updateUsuarioSchema } from "../dtos/usuario.dto";
import { validateRequest } from "../middlewares/validate-request.middleware";

export class UsuarioRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new usuarioController()
        //Rutas
        //localhost:3000/usuario/
        router.get('/', asyncHandler(controller.listar))

        router.get('/:id', asyncHandler(controller.obtenerPorId))

        router.put('/bloquear/:id', asyncHandler(controller.bloquear))

        router.put('/activar/:id', asyncHandler(controller.activar))

        router.post("/", validateRequest(createUsuarioSchema), asyncHandler(controller.crear))
        router.put("/:id", validateRequest(updateUsuarioSchema), asyncHandler(controller.actualizar))

        return router
    }
}