import { Request, Response } from "express";
import * as profileService from "../services/profile.service";
import {
  collectImagePublicIds,
  requestAssetCleanup,
  validateImageReferences,
} from "../services/upload.service";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import {
  profileUpdateSchema,
} from "../validations/profile.validation";

const cleanupAssets = async (publicIds: string[]) => {
  const results = await Promise.all(
    publicIds.map(async (publicId) => {
      try {
        return await requestAssetCleanup(publicId);
      } catch {
        console.error("Cloudinary asset cleanup could not be queued.", {
          publicId,
        });
        return "pending" as const;
      }
    }),
  );
  return publicIds.filter((_, index) => results[index] === "pending");
};

export const getPublicProfile = asyncHandler(
  async (_req: Request, res: Response) => {
    const profile = await profileService.getPublicProfile();
    res.json(new ApiResponse(200, profile, "Profile retrieved successfully."));
  },
);

export const getAdminProfile = asyncHandler(
  async (_req: Request, res: Response) => {
    const profile = await profileService.getProfile();
    res.json(new ApiResponse(200, profile, "Profile retrieved successfully."));
  },
);

export const updateAdminProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const data = profileUpdateSchema.parse(req.body);
    const previous = await profileService.getProfile();
    const previousIds = collectImagePublicIds(previous);
    await validateImageReferences(data);
    let profile;
    try {
      profile = await profileService.updateProfile(data);
    } catch (error) {
      await cleanupAssets(collectImagePublicIds(data));
      throw error;
    }

    const nextIds = new Set(collectImagePublicIds(profile));
    const removedIds = previousIds.filter((publicId) => !nextIds.has(publicId));
    const pending = await cleanupAssets(removedIds);
    const statusCode = pending.length > 0 ? 202 : 200;
    res.status(statusCode).json(
      new ApiResponse(
        statusCode,
        pending.length > 0 ? { profile, cleanupPending: pending } : profile,
        pending.length > 0
          ? "Profile updated; image cleanup is queued for retry."
          : "Profile updated successfully.",
      ),
    );
  },
);
