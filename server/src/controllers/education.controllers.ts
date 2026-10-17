import { Request, Response } from "express";
import * as educationService from "../services/education.service";
import { createCrudHandlers } from "./crud.controllers";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const educationController = createCrudHandlers(
  educationService.educationCrudService,
);
export const listPublicEducation = asyncHandler(
  async (_req: Request, res: Response) => {
    const education = await educationService.listEducation();
    res.json(new ApiResponse(200, education, "Education retrieved successfully."));
  },
);
