import { Request, Response } from "express";
import * as uploadService from "../services/upload.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  deleteUploadSchema,
  uploadRequestSchema,
} from "../validations/upload.validation";

const getFiles = (req: Request) => {
  if ("file" in req && req.file) return [req.file];
  if ("files" in req && Array.isArray(req.files)) return req.files;
  return [];
};

export const uploadImage = asyncHandler(
  async (req: Request, res: Response) => {
    const { folder } = uploadRequestSchema.parse(req.body);
    const file = getFiles(req)[0];
    if (!file) {
      throw new ApiError(400, "An image file is required.");
    }
    const asset = await uploadService.uploadImage(file.buffer, folder);
    res
      .status(201)
      .json(new ApiResponse(201, asset, "Image uploaded successfully."));
  },
);

export const uploadImages = asyncHandler(
  async (req: Request, res: Response) => {
    const { folder } = uploadRequestSchema.parse(req.body);
    const files = getFiles(req);
    if (files.length === 0) {
      throw new ApiError(400, "At least one image file is required.");
    }
    const assets = await uploadService.uploadImages(
      files.map((file) => file.buffer),
      folder,
    );
    res
      .status(201)
      .json(new ApiResponse(201, assets, "Images uploaded successfully."));
  },
);

export const deleteImage = asyncHandler(
  async (req: Request, res: Response) => {
    const { publicId } = deleteUploadSchema.parse(req.body);
    const result = await uploadService.deleteManagedAsset(publicId);
    res
      .status(result.deletionPending ? 202 : 200)
      .json(
        new ApiResponse(
          result.deletionPending ? 202 : 200,
          result,
          result.deletionPending
            ? "Image deletion is queued for retry."
            : "Image deleted successfully.",
        ),
      );
  },
);

export const retryCleanup = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await uploadService.retryPendingAssetCleanup();
    const statusCode = result.pending > 0 ? 202 : 200;
    res.status(statusCode).json(
      new ApiResponse(
        statusCode,
        result,
        result.pending > 0
          ? "Cleanup reconciliation completed with assets still pending."
          : "Media cleanup reconciliation completed.",
      ),
    );
  },
);
