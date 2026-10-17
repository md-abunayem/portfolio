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
const date = z
  .union([z.iso.date(), z.iso.datetime({ offset: true })])
  .transform((value) => new Date(value));
const certificationFields = {
  title: z.string().trim().min(1).max(240),
  issuer: optionalText(200),
  description: optionalText(10000),
  issueDate: date.nullable().optional(),
  expiryDate: date.nullable().optional(),
  credentialId: optionalText(240),
  credentialUrl: optionalUrl,
  imageUrl: optionalImageUrl,
  imagePublicId: optionalImagePublicId,
};
const checkCertificationDates = (
  value: { issueDate?: Date | null; expiryDate?: Date | null },
  ctx: z.RefinementCtx,
) => {
  if (value.issueDate && value.expiryDate && value.expiryDate < value.issueDate) {
    ctx.addIssue({
      code: "custom",
      path: ["expiryDate"],
      message: "Expiry date cannot be earlier than issue date.",
    });
  }
};

const checkCertification = (
  value: { issueDate?: Date | null; expiryDate?: Date | null } & Record<
    string,
    unknown
  >,
  ctx: z.RefinementCtx,
) => {
  checkCertificationDates(value, ctx);
  validateImageMetadataPairs(value, ctx, [
    { urlField: "imageUrl", publicIdField: "imagePublicId" },
  ]);
};

export const certificationCreateSchema = z
  .object(certificationFields)
  .strict()
  .superRefine(checkCertification);
export const certificationUpdateSchema = z
  .object(certificationFields)
  .partial()
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided.",
      });
    }
    checkCertification(value, ctx);
  });
