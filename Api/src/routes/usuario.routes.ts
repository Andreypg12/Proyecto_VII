import { Router } from "express";
import { usuarioController } from "../controllers/usuario.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import {
    createUsuarioSchema,
    updateUsuarioSchema,
    registerUsuarioSchema,
    loginUsuarioSchema,
    updatePerfilUsuarioSchema
} from "../dtos/usuario.dto";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";

export class UsuarioRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new usuarioController();

        /// Get

            //listado
                router.get('/', asyncHandler(controller.listar));

            //configuración
            router.get('/config',asyncHandler(controller.obtenerConfiguracion));

            //Autenticación
            router.post("/register",validateRequest(registerUsuarioSchema),asyncHandler(controller.registrar));
            router.post("/login",validateRequest(loginUsuarioSchema),asyncHandler(controller.login));
            router.get("/perfil",authenticateToken,asyncHandler(controller.perfil));

            //Usuario por ID
            router.get('/:id', asyncHandler(controller.obtenerPorId));

            

        /// Post / Put

            //Creación general
            router.post("/",validateRequest(createUsuarioSchema),asyncHandler(controller.crear));

            // Actualizar perfil del usuario autenticado
            router.put("/perfil", authenticateToken, validateRequest(updatePerfilUsuarioSchema), asyncHandler(controller.actualizarPerfil));
            router.put( "/:id", validateRequest(updateUsuarioSchema), asyncHandler(controller.actualizar));

            //Cambios estado
            router.put('/activar/:id', asyncHandler(controller.activar));
            router.put('/bloquear/:id', asyncHandler(controller.bloquear));

        return router;
    }
}