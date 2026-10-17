import { z } from "zod";

const optionalText = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).optional();

export const messageCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    subject: optionalText(200),
    message: z.string().trim().min(1).max(5000),
  })
  .strict();

export const messageStatusSchema = z
  .object({
    status: z.enum(["UNREAD", "READ", "REPLIED"]),
  })
  .strict();

export const messagePageSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
    status: z.enum(["UNREAD", "READ", "REPLIED"]).optional(),
  })
  .strict();
