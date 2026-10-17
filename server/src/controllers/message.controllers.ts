import { Request, Response } from "express";
import * as messageService from "../services/message.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const listMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await messageService.listMessages(req.query);
    res.json(new ApiResponse(200, result, "Messages retrieved."));
  },
);

export const submitContact = asyncHandler(
  async (req: Request, res: Response) => {
    const message = await messageService.submitContactMessage(req.body);
    res
      .status(201)
      .json(new ApiResponse(201, { id: message.id }, "Message received."));
  },
);

export const getMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const message = await messageService.getMessage(req.params.id);
    res.json(new ApiResponse(200, message, "Message retrieved."));
  },
);

export const updateMessageStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const message = await messageService.updateMessageStatus(
      req.params.id,
      req.body,
    );
    res.json(new ApiResponse(200, message, "Message status updated."));
  },
);

export const deleteMessage = asyncHandler(
  async (req: Request, res: Response) => {
    await messageService.deleteMessage(req.params.id);
    res.status(204).send();
  },
);
