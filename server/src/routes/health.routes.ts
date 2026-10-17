import { Router } from "express";
import * as healthController from "../controllers/health.controllers";

const router = Router();

router.get("/", healthController.getLiveness);
router.get("/ready", healthController.getReadiness);

export default router;
