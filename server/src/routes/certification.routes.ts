import { Router } from "express";
import {
  certificationController,
  listPublicCertifications,
} from "../controllers/certification.controllers";
import { registerCrudRoutes } from "./crud.routes";

const router = Router();

router.get("/certifications", listPublicCertifications);
registerCrudRoutes(router, "/admin/certifications", certificationController);

export default router;
