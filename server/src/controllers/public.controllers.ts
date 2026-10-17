import { Request, Response } from "express";
import * as publicContentService from "../services/publicContent.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const sendPublicList = (
  operation: () => Promise<unknown>,
  message: string,
) =>
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await operation();
    res.json(new ApiResponse(200, data, message));
  });

export const getPortfolio = sendPublicList(
  publicContentService.getPortfolio,
  "Portfolio content retrieved.",
);
