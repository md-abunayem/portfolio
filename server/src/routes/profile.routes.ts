import { Router } from "express";
import * as profileController from "../controllers/profile.controllers";

const router = Router();

router.get("/profile", profileController.getPublicProfile);
router.get("/admin/profile", profileController.getAdminProfile);
router.patch("/admin/profile", profileController.updateAdminProfile);

export default router;
