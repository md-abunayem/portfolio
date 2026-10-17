import { z } from "zod";

export const cloudinaryImageUrlSchema = z
  .string()
  .url()
  .max(2048)
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.includes("/image/upload/")
    );
  }, "Image URL must be a secure Cloudinary image URL.");

export const optionalImageUrl = cloudinaryImageUrlSchema.nullable().optional();
export const optionalImagePublicId = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .nullable()
  .optional();

export type ImageMetadataPair = {
  urlField: string;
  publicIdField: string;
};

export const validateImageMetadataPairs = (
  value: Record<string, unknown>,
  ctx: z.RefinementCtx,
  pairs: ImageMetadataPair[],
) => {
  for (const pair of pairs) {
    const hasUrl = Object.hasOwn(value, pair.urlField);
    const hasPublicId = Object.hasOwn(value, pair.publicIdField);
    if (hasUrl !== hasPublicId) {
      ctx.addIssue({
        code: "custom",
        path: [hasUrl ? pair.publicIdField : pair.urlField],
        message: "Image URL and Cloudinary public ID must be provided together.",
      });
    }
  }
};
