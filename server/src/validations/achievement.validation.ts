import { z } from "zod";
import {
  optionalImagePublicId,
  optionalImageUrl,
  validateImageMetadataPairs,
} from "./image.validation";

const optionalUrl = z
  .union([z.string().url().max(2048), z.literal(""), z.null()])
  .optional()
  .transform((value) => (value === "" ? null : value));
const optionalText = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).optional();
const date = z
  .union([z.iso.date(), z.iso.datetime({ offset: true })])
  .transform((value) => new Date(value));
const achievementFields = {
  title: z.string().trim().min(1).max(200),
  organization: optionalText(200),
  description: z.string().trim().min(1).max(10000),
  date: date.nullable().optional(),
  link: optionalUrl,
  imageUrl: optionalImageUrl,
  imagePublicId: optionalImagePublicId,
};

export const achievementCreateSchema = z
  .object(achievementFields)
  .strict()
  .superRefine((value, ctx) =>
    validateImageMetadataPairs(value, ctx, [
      { urlField: "imageUrl", publicIdField: "imagePublicId" },
    ]),
  );
export const achievementUpdateSchema = z
  .object(achievementFields)
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
