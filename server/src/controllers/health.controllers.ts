import { Request, Response } from "express";
import * as healthService from "../services/health.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getLiveness = (_req: Request, res: Response) => {
  res.json(
    new ApiResponse(200, healthService.getLiveness(), "Service is running."),
  );
};

export const getReadiness = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await healthService.checkReadiness();
    res.json(new ApiResponse(200, data, "Service is ready."));
  },
);
