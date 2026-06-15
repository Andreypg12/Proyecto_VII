import { Router } from "express";
import { ProfesionalController } from "../controllers/profesional.controller";

export class ProfesionalRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new ProfesionalController()
        //Rutas
        //locahost:3000/videojuego/
        router.get('/', controller.listar)
        return router
    }
}