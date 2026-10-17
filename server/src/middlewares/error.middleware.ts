import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { Prisma } from "../generated/prisma";
import { MulterError } from "./upload.middleware";
import { ZodError } from "zod";

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

  if (err instanceof ZodError) {
    res.status(400).json({
      statusCode: 400,
      success: false,
      data: null,
      message: "Request validation failed.",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof MulterError) {
    const statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    res.status(statusCode).json({
      statusCode,
      success: false,
      data: null,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "Image files must be 5 MB or smaller."
          : "Multipart image upload is invalid or exceeds the allowed file count.",
      errors: [],
    });
    return;
  }

  if (
    err instanceof Error &&
    ["Unexpected end of form", "Multipart: Boundary not found"].includes(
      err.message,
    )
  ) {
    res.status(400).json({
      statusCode: 400,
      success: false,
      data: null,
      message: "Multipart image upload is malformed.",
      errors: [],
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        statusCode: 409,
        success: false,
        data: null,
        message: "A record with the same unique value already exists.",
        errors: err.meta?.target ?? [],
      });
      return;
    }

    if (err.code === "P2025") {
      res.status(404).json({
        statusCode: 404,
        success: false,
        data: null,
        message: "Record not found.",
        errors: [],
      });
      return;
    }
  }

  if (
    err instanceof Error &&
    "type" in err &&
    err.type === "entity.too.large"
  ) {
    res.status(413).json({
      statusCode: 413,
      success: false,
      data: null,
      message: "Request body is too large.",
      errors: [],
    });
    return;
  }

  if (
    err instanceof SyntaxError &&
    "status" in err &&
    err.status === 400 &&
    "body" in err
  ) {
    res.status(400).json({
      statusCode: 400,
      success: false,
      data: null,
      message: "Request body contains invalid JSON.",
      errors: [],
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