import { Router } from "express";
import {
  educationController,
  listPublicEducation,
} from "../controllers/education.controllers";
import { registerCrudRoutes } from "./crud.routes";

const router = Router();

router.get("/education", listPublicEducation);
registerCrudRoutes(router, "/admin/education", educationController);

export default router;
