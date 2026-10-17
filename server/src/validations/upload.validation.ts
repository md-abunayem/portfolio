import { z } from "zod";

export const uploadFolders = [
  "portfolio/general",
  "portfolio/profile",
  "portfolio/projects",
  "portfolio/skills",
  "portfolio/certifications",
  "portfolio/achievements",
  "portfolio/education",
  "portfolio/experience",
  "portfolio/research",
] as const;

export const uploadRequestSchema = z
  .object({
    folder: z.enum(uploadFolders).optional().default("portfolio/general"),
  })
  .strict();

export const deleteUploadSchema = z
  .object({
    publicId: z.string().trim().min(1).max(255),
  })
  .strict();
