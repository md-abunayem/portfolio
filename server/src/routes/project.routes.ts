import { Router } from "express";
import * as projectController from "../controllers/project.controllers";
import { adminProjectController } from "../controllers/project.controllers";
import { registerCrudRoutes } from "./crud.routes";

const router = Router();

router.get("/projects", projectController.listProjects);
router.get("/projects/featured", projectController.listFeaturedProjects);
router.get("/projects/:slug", projectController.getProject);
registerCrudRoutes(router, "/admin/projects", adminProjectController);

export default router;
