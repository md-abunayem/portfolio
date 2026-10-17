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
const experienceFields = {
  company: z.string().trim().min(1).max(160),
  position: z.string().trim().min(1).max(160),
  location: optionalText(160),
  description: z.string().trim().min(1).max(10000),
  startDate: date,
  endDate: date.nullable().optional(),
  current: z.boolean().optional(),
  companyLogoUrl: optionalImageUrl,
  companyLogoPublicId: optionalImagePublicId,
};
const checkExperienceDates = (
  value: { startDate?: Date; endDate?: Date | null; current?: boolean },
  ctx: z.RefinementCtx,
) => {
  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "End date cannot be earlier than start date.",
    });
  }
  if (value.current === true && value.endDate) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "A current experience must not have an end date.",
    });
  }
};

export const experienceCreateSchema = z
  .object(experienceFields)
  .strict()
  .superRefine((value, ctx) => {
    checkExperienceDates(value, ctx);
    validateImageMetadataPairs(value, ctx, [
      { urlField: "companyLogoUrl", publicIdField: "companyLogoPublicId" },
    ]);
  });
export const experienceUpdateSchema = z
  .object(experienceFields)
  .partial()
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided.",
      });
    }
    checkExperienceDates(value, ctx);
    validateImageMetadataPairs(value, ctx, [
      { urlField: "companyLogoUrl", publicIdField: "companyLogoPublicId" },
    ]);
  });
