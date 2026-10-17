import { Router } from "express";
import {
  listPublicResearch,
  researchController,
} from "../controllers/research.controllers";
import { registerCrudRoutes } from "./crud.routes";

const router = Router();

router.get("/research", listPublicResearch);
registerCrudRoutes(router, "/admin/research", researchController);

export default router;
