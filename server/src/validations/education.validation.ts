import { z } from "zod";
import {
  optionalImagePublicId,
  optionalImageUrl,
  validateImageMetadataPairs,
} from "./image.validation";

const optionalText = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).optional();
const date = z
  .union([z.iso.date(), z.iso.datetime({ offset: true })])
  .transform((value) => new Date(value));
const educationFields = {
  institution: z.string().trim().min(1).max(200),
  degree: z.string().trim().min(1).max(160),
  field: optionalText(160),
  description: optionalText(10000),
  startDate: date,
  endDate: date.nullable().optional(),
  grade: optionalText(80),
  institutionLogoUrl: optionalImageUrl,
  institutionLogoPublicId: optionalImagePublicId,
};
const checkEducationDates = (
  value: { startDate?: Date; endDate?: Date | null },
  ctx: z.RefinementCtx,
) => {
  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "End date cannot be earlier than start date.",
    });
  }
};

export const educationCreateSchema = z
  .object(educationFields)
  .strict()
  .superRefine((value, ctx) => {
    checkEducationDates(value, ctx);
    validateImageMetadataPairs(value, ctx, [
      {
        urlField: "institutionLogoUrl",
        publicIdField: "institutionLogoPublicId",
      },
    ]);
  });
export const educationUpdateSchema = z
  .object(educationFields)
  .partial()
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided.",
      });
    }
    checkEducationDates(value, ctx);
    validateImageMetadataPairs(value, ctx, [
      {
        urlField: "institutionLogoUrl",
        publicIdField: "institutionLogoPublicId",
      },
    ]);
  });
