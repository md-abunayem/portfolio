import { rateLimit } from "express-rate-limit";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

const rateLimitResponse =
  (message: string) =>
  (_req: Request, _res: Response, next: NextFunction) => {
    next(new ApiError(429, message));
  };

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitResponse("Too many sign-in attempts. Try again later."),
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitResponse("Too many messages submitted. Please try again later."),
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitResponse("Too many image uploads. Try again later."),
});
