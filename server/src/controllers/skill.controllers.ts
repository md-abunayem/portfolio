import { Request, Response } from "express";
import * as skillService from "../services/skill.service";
import { createCrudHandlers } from "./crud.controllers";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const skillController = createCrudHandlers(skillService.skillCrudService);
export const listPublicSkills = asyncHandler(async (_req: Request, res: Response) => {
  const skills = await skillService.listSkills();
  res.json(new ApiResponse(200, skills, "Skills retrieved successfully."));
});
