import { Request, Response } from "express";
import * as certificationService from "../services/certification.service";
import { createCrudHandlers } from "./crud.controllers";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const certificationController = createCrudHandlers(
  certificationService.certificationCrudService,
);

export const listPublicCertifications = asyncHandler(
  async (_req: Request, res: Response) => {
    const certifications = await certificationService.listCertifications();
    res.json(
      new ApiResponse(
        200,
        certifications,
        "Certifications retrieved successfully.",
      ),
    );
  },
);
