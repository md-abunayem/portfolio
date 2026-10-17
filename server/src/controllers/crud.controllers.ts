import { Request, Response } from "express";
import { CrudOperations } from "../types/crud";
import {
  collectionQuerySchema,
  idSchema,
} from "../validations/crud.validation";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import {
  collectImagePublicIds,
  requestAssetCleanup,
  validateImageReferences,
} from "../services/upload.service";

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

export const createCrudHandlers = <CreateInput, UpdateInput, RecordType>(
  operations: CrudOperations<CreateInput, UpdateInput, RecordType>,
) => ({
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, pageSize } = collectionQuerySchema.parse(req.query);
    const [items, total] = await Promise.all([
      operations.list((page - 1) * pageSize, pageSize),
      operations.count(),
    ]);
    res.json(
      new ApiResponse(
        200,
        { items, page, pageSize, total },
        "Records retrieved successfully.",
      ),
    );
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const id = idSchema.parse(req.params.id);
    const item = await operations.get(id);
    if (!item) {
      throw new ApiError(404, "Record not found.");
    }
    res.json(new ApiResponse(200, item, "Record retrieved successfully."));
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const data = operations.createSchema.parse(req.body);
    await validateImageReferences(data);
    let item: RecordType;
    try {
      item = await operations.create(data);
    } catch (error) {
      await cleanupAssets(collectImagePublicIds(data));
      throw error;
    }
    res
      .status(201)
      .json(new ApiResponse(201, item, "Record created successfully."));
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const id = idSchema.parse(req.params.id);
    const data = operations.updateSchema.parse(req.body);
    const previous = await operations.get(id);
    if (!previous) {
      throw new ApiError(404, "Record not found.");
    }
    await validateImageReferences(data);

    let item: RecordType;
    try {
      item = await operations.update(id, data);
    } catch (error) {
      await cleanupAssets(collectImagePublicIds(data));
      throw error;
    }

    const nextIds = new Set(collectImagePublicIds(item));
    const removedIds = collectImagePublicIds(previous).filter(
      (publicId) => !nextIds.has(publicId),
    );
    const pending = await cleanupAssets(removedIds);
    const statusCode = pending.length > 0 ? 202 : 200;
    res.status(statusCode).json(
      new ApiResponse(
        statusCode,
        pending.length > 0 ? { item, cleanupPending: pending } : item,
        pending.length > 0
          ? "Record updated; image cleanup is queued for retry."
          : "Record updated successfully.",
      ),
    );
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    const id = idSchema.parse(req.params.id);
    const removed = await operations.remove(id);
    const pending = await cleanupAssets(collectImagePublicIds(removed));
    if (pending.length > 0) {
      res
        .status(202)
        .json(
          new ApiResponse(
            202,
            { cleanupPending: pending },
            "Record deleted; image cleanup is queued for retry.",
          ),
        );
      return;
    }
    res.status(204).send();
  }),
});
