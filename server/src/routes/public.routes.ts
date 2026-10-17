import { Router } from "express";
import * as publicController from "../controllers/public.controllers";
import * as messageController from "../controllers/message.controllers";
import { contactLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.get("/portfolio", publicController.getPortfolio);
router.post("/messages", contactLimiter, messageController.submitContact);

export default router;
