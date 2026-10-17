import { Request, Response } from "express";
import * as achievementService from "../services/achievement.service";
import { createCrudHandlers } from "./crud.controllers";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const achievementController = createCrudHandlers(
  achievementService.achievementCrudService,
);
export const listPublicAchievements = asyncHandler(
  async (_req: Request, res: Response) => {
    const achievements = await achievementService.listAchievements();
    res.json(
      new ApiResponse(200, achievements, "Achievements retrieved successfully."),
    );
  },
);
