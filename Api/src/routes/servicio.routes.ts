import { Router } from "express";
import { ServicioController } from "../controllers/servicio.controller";

export class ServicioRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new ServicioController()
        //Rutas
        //locahost:3000/servicio/
        router.get('/', controller.listar)
        return router
    }
}