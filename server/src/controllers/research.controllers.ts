import { Request, Response } from "express";
import * as researchService from "../services/research.service";
import { createCrudHandlers } from "./crud.controllers";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const researchController = createCrudHandlers(
  researchService.researchCrudService,
);
export const listPublicResearch = asyncHandler(
  async (_req: Request, res: Response) => {
    const research = await researchService.listResearch();
    res.json(new ApiResponse(200, research, "Research retrieved successfully."));
  },
);
