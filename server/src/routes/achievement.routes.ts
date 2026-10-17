import { Router } from "express";
import {
  achievementController,
  listPublicAchievements,
} from "../controllers/achievement.controllers";
import { registerCrudRoutes } from "./crud.routes";

const router = Router();

router.get("/achievements", listPublicAchievements);
registerCrudRoutes(router, "/admin/achievements", achievementController);

export default router;
