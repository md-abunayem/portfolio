import { Request, Response } from "express";
import * as experienceService from "../services/experience.service";
import { createCrudHandlers } from "./crud.controllers";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const experienceController = createCrudHandlers(
  experienceService.experienceCrudService,
);
export const listPublicExperiences = asyncHandler(
  async (_req: Request, res: Response) => {
    const experiences = await experienceService.listExperiences();
    res.json(
      new ApiResponse(200, experiences, "Experience retrieved successfully."),
    );
  },
);
