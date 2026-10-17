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
const researchFields = {
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(10000),
  authors: optionalText(1000),
  publication: optionalText(240),
  link: optionalUrl,
  publishedAt: date.nullable().optional(),
  imageUrl: optionalImageUrl,
  imagePublicId: optionalImagePublicId,
};

export const researchCreateSchema = z
  .object(researchFields)
  .strict()
  .superRefine((value, ctx) =>
    validateImageMetadataPairs(value, ctx, [
      { urlField: "imageUrl", publicIdField: "imagePublicId" },
    ]),
  );
export const researchUpdateSchema = z
  .object(researchFields)
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
