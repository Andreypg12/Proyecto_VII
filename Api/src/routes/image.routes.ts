import { Router } from "express";
import { ImageController } from "../controllers/image.controller";
export class ImageRoutes {
    static get routes() {
        const router = Router();
        const imageController = new ImageController();

        router.post("/upload", imageController.upload);
        router.get("/files", imageController.getListFiles);
        router.get("/download/:name", imageController.download);
        return router;
    }
}