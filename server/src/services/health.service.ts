import prisma from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export const getLiveness = () => ({ status: "ok" });

export const checkReadiness = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error("Readiness check could not reach the database.", error);
    throw new ApiError(503, "Service is not ready.");
  }

  return { status: "ready" };
};
