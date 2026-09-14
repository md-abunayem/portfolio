import { z } from "zod";

const projectStatusSchema = z.enum(["DRAFT",
  "PUBLISHED",])

  