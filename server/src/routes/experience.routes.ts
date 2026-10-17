import { Router } from "express";
import {
  experienceController,
  listPublicExperiences,
} from "../controllers/experience.controllers";
import { registerCrudRoutes } from "./crud.routes";

const router = Router();

router.get("/experiences", listPublicExperiences);
registerCrudRoutes(router, "/admin/experiences", experienceController);

export default router;
