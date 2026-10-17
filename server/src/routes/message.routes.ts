import { Router } from "express";
import * as messageController from "../controllers/message.controllers";
import { contactLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post("/contact", contactLimiter, messageController.submitContact);
router.get("/admin/messages", messageController.listMessages);
router.get("/admin/messages/:id", messageController.getMessage);
router.patch("/admin/messages/:id/status", messageController.updateMessageStatus);
router.patch("/admin/messages/:id", messageController.updateMessageStatus);
router.delete("/admin/messages/:id", messageController.deleteMessage);

export default router;
