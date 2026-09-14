import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: err.success,
      data: err.data,
      message: err.message,
      errors: err.errors,
    });

    return;
  }

  res.status(500).json({
    statusCode: 500,
    success: false,
    data: null,
    message: "Internal server error",
    errors: [],
  });
};