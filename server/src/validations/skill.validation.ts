import { z } from "zod";
import {
  optionalImagePublicId,
  optionalImageUrl,
  validateImageMetadataPairs,
} from "./image.validation";

const optionalText = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).optional();
const skillFields = {
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(80),
  level: z.number().int().min(0).max(100).nullable().optional(),
  icon: optionalText(256),
  imageUrl: optionalImageUrl,
  imagePublicId: optionalImagePublicId,
};

export const skillCreateSchema = z
  .object(skillFields)
  .strict()
  .superRefine((value, ctx) =>
    validateImageMetadataPairs(value, ctx, [
      { urlField: "imageUrl", publicIdField: "imagePublicId" },
    ]),
  );
export const skillUpdateSchema = z
  .object(skillFields)
  .partial()
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided.",
      });
    }
    validateImageMetadataPairs(value, ctx, [
      { urlField: "imageUrl", publicIdField: "imagePublicId" },
    ]);
  });
