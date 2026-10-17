import {
  projectSchema,
  publicPortfolioResponseSchema,
  type PublicPortfolio,
} from "@/features/portfolio/schema";
import { serverApiRequest } from "@/lib/api/server";
import { ApiError } from "@/types/api";
import { z } from "zod";

export type PublicPortfolioResult =
  | { status: "success"; data: PublicPortfolio }
  | { status: "error"; message: string };

export async function getPublicPortfolio(): Promise<PublicPortfolioResult> {
  try {
    const envelope = await serverApiRequest<PublicPortfolio>("public/portfolio", {
      next: { revalidate: 300 },
    });
    if (!envelope) {
      return { status: "error", message: "Portfolio content is temporarily unavailable." };
    }
    const payload: unknown = envelope;
    const parsed = publicPortfolioResponseSchema.safeParse(payload);
    if (!parsed.success) {
      console.error("The portfolio API returned an unexpected response shape.", parsed.error);
      return {
        status: "error",
        message: "Portfolio content is temporarily unavailable.",
      };
    }

    return { status: "success", data: parsed.data.data };
  } catch (error) {
    console.error("Unable to retrieve public portfolio content.", error);
    return {
      status: "error",
      message: "Portfolio content is temporarily unavailable. Please try again later.",
    };
  }
}

const publicProjectResponseSchema = z.object({
  success: z.literal(true),
  data: projectSchema,
});

export type PublicProjectResult =
  | { status: "success"; data: PublicPortfolio["projects"][number] }
  | { status: "not-found" }
  | { status: "error"; message: string };

export async function getPublicProject(slug: string): Promise<PublicProjectResult> {
  try {
    const envelope = await serverApiRequest<PublicPortfolio["projects"][number]>(
      `projects/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
    );
    if (!envelope) {
      return { status: "error", message: "Project details are temporarily unavailable." };
    }
    const payload: unknown = envelope;
    const parsed = publicProjectResponseSchema.safeParse(payload);
    if (!parsed.success) {
      console.error("The project API returned an unexpected response shape.", parsed.error);
      return { status: "error", message: "Project details are temporarily unavailable." };
    }
    return { status: "success", data: parsed.data.data };
  } catch (error) {
    if (error instanceof ApiError && error.code === "not-found") {
      return { status: "not-found" };
    }
    console.error("Unable to retrieve public project details.", error);
    return {
      status: "error",
      message: "Project details are temporarily unavailable. Please try again later.",
    };
  }
}
