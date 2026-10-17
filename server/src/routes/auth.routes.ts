import { Router } from "express";
import * as authController from "../controllers/auth.controllers";
import {
  requireAdmin,
  requireSameOrigin,
} from "../middlewares/auth.middleware";
import { loginLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post("/login", requireSameOrigin, loginLimiter, authController.login);
router.post(
  "/logout",
  requireSameOrigin,
  requireAdmin,
  authController.logout,
);
router.post(
  "/logout-all",
  requireSameOrigin,
  requireAdmin,
  authController.logoutAll,
);
router.get("/me", requireAdmin, authController.currentAdmin);
router.patch(
  "/password",
  requireSameOrigin,
  requireAdmin,
  authController.changePassword,
);

export default router;
