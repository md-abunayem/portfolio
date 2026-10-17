import { z } from "zod";
import {
  optionalImagePublicId,
  optionalImageUrl,
  validateImageMetadataPairs,
} from "./image.validation";

const optionalText = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).optional();
const optionalUrl = z
  .union([z.string().url().max(2048), z.literal(""), z.null()])
  .optional()
  .transform((value) => (value === "" ? null : value));
const profileFields = {
  name: z.string().trim().min(1).max(160),
  headline: optionalText(240),
  shortBio: optionalText(1000),
  about: optionalText(20000),
  profileImageUrl: optionalImageUrl,
  profileImagePublicId: optionalImagePublicId,
  heroImageUrl: optionalImageUrl,
  heroImagePublicId: optionalImagePublicId,
  resumeUrl: optionalUrl,
};
const validateProfileImages = (
  value: Record<string, unknown>,
  ctx: z.RefinementCtx,
) =>
  validateImageMetadataPairs(value, ctx, [
    { urlField: "profileImageUrl", publicIdField: "profileImagePublicId" },
    { urlField: "heroImageUrl", publicIdField: "heroImagePublicId" },
  ]);

export const profileCreateSchema = z
  .object(profileFields)
  .strict()
  .superRefine(validateProfileImages);
export const profileUpdateSchema = z
  .object(profileFields)
  .partial()
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided.",
      });
    }
    validateProfileImages(value, ctx);
  });
