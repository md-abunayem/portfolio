import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { loginSchema, passwordChangeSchema } from "../validations/auth.validation";
import { SESSION_COOKIE } from "../utils/sessionToken";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../config/env";

const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
const cookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production" || env.COOKIE_SAME_SITE === "none",
  sameSite: env.COOKIE_SAME_SITE,
  path: "/api/v1",
  maxAge: sessionDurationMs,
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const { admin, token } = await authService.createAdminSession(email, password);
  res.cookie(SESSION_COOKIE, token, cookieOptions());
  res.json(new ApiResponse(200, admin, "Signed in successfully."));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.revokeSession(req.cookies?.[SESSION_COOKIE]);
  res.clearCookie(SESSION_COOKIE, { ...cookieOptions(), maxAge: undefined });
  res.json(new ApiResponse(200, null, "Signed out successfully."));
});

export const logoutAll = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.admin) {
      throw new ApiError(401, "Authentication required.");
    }
    await authService.revokeAllSessions(req.admin.id);
    res.clearCookie(SESSION_COOKIE, { ...cookieOptions(), maxAge: undefined });
    res.json(new ApiResponse(200, null, "All sessions were signed out."));
  },
);

export const currentAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.admin) {
      throw new ApiError(401, "Authentication required.");
    }
    res.json(new ApiResponse(200, req.admin, "Current administrator."));
  },
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.admin) {
      throw new ApiError(401, "Authentication required.");
    }
    const { currentPassword, newPassword } =
      passwordChangeSchema.parse(req.body);
    const { admin, token } = await authService.changeAdminPassword(
      req.admin.id,
      currentPassword,
      newPassword,
    );
    res.cookie(SESSION_COOKIE, token, cookieOptions());
    res.json(
      new ApiResponse(
        200,
        admin,
        "Password changed successfully. Other sessions were signed out.",
      ),
    );
  },
);
