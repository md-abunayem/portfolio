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
const requiredText = (max: number) => z.string().trim().min(1).max(max);
const projectFields = {
  title: requiredText(160),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: requiredText(10000),
  image: optionalImageUrl,
  imagePublicId: optionalImagePublicId,
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  featured: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  technologies: z
    .array(requiredText(60).transform((name) => name.replace(/\s+/g, " ")))
    .max(30)
    .optional(),
};
const duplicateTechnologyCheck = (
  value: { technologies?: string[] },
  ctx: z.RefinementCtx,
) => {
  const names = value.technologies?.map((name) => name.toLowerCase());
  if (names && new Set(names).size !== names.length) {
    ctx.addIssue({
      code: "custom",
      path: ["technologies"],
      message: "Technologies must not contain duplicates.",
    });
  }
};

export const projectCreateSchema = z
  .object({
    ...projectFields,
    status: projectFields.status.default("DRAFT"),
    technologies: projectFields.technologies.default([]),
  })
  .strict()
  .superRefine((value, ctx) => {
    duplicateTechnologyCheck(value, ctx);
    validateImageMetadataPairs(value, ctx, [
      { urlField: "image", publicIdField: "imagePublicId" },
    ]);
  });

export const projectUpdateSchema = z
  .object(projectFields)
  .partial()
  .strict()
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided.",
      });
    }
    duplicateTechnologyCheck(value, ctx);
    validateImageMetadataPairs(value, ctx, [
      { urlField: "image", publicIdField: "imagePublicId" },
    ]);
  });

export const projectSlugSchema = z
  .string()
  .min(1)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const projectListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(9),
    search: z.string().trim().max(200).optional(),
    featured: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    technology: z.string().trim().min(1).max(60).optional(),
  })
  .strict();
