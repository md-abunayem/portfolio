import { Router } from "express";
import {
  listPublicSkills,
  skillController,
} from "../controllers/skill.controllers";
import { registerCrudRoutes } from "./crud.routes";

const router = Router();

router.get("/skills", listPublicSkills);
registerCrudRoutes(router, "/admin/skills", skillController);

export default router;
