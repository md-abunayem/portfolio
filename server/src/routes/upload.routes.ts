import { Router } from "express";
import * as uploadController from "../controllers/upload.controller";
import {
  uploadMultipleImages,
  uploadSingleImage,
} from "../middlewares/upload.middleware";
import { uploadLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post(
  "/admin/uploads/image",
  uploadLimiter,
  uploadSingleImage,
  uploadController.uploadImage,
);
router.post(
  "/admin/uploads/images",
  uploadLimiter,
  uploadMultipleImages,
  uploadController.uploadImages,
);
router.delete("/admin/uploads/image", uploadController.deleteImage);
router.post("/admin/uploads/cleanup/retry", uploadController.retryCleanup);

export default router;
