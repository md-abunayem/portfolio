import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../config/env";
import { hashSessionToken, SESSION_COOKIE } from "../utils/sessionToken";

export { hashSessionToken, SESSION_COOKIE };

export const requireAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) {
      throw new ApiError(401, "Authentication required.");
    }

    const tokenHash = hashSessionToken(token);
    const session = await prisma.session.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        admin: { select: { id: true, name: true, email: true } },
      },
    });

    if (!session) {
      await prisma.session.deleteMany({ where: { tokenHash } });
      throw new ApiError(401, "Session expired. Please sign in again.");
    }

    req.admin = session.admin;
    next();
  },
);

export const requireSameOrigin = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  const origin = req.get("origin");
  if (!origin) {
    next(new ApiError(403, "Origin header is required for this request."));
    return;
  }

  if (!env.CLIENT_ORIGINS.includes(origin)) {
    next(new ApiError(403, "Request origin is not allowed."));
    return;
  }

  next();
};
