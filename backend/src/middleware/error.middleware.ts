import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return sendError(
      res,
      "Validation failed",
      422,
      "VALIDATION_ERROR",
      err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }))
    );
  }

  // Operational AppError
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // Prisma known errors
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as Error & { code?: string };
    if (prismaErr.code === "P2002") {
      return sendError(res, "A record with this value already exists", 409, "DUPLICATE");
    }
    if (prismaErr.code === "P2025") {
      return sendError(res, "Record not found", 404, "NOT_FOUND");
    }
  }

  // Unexpected errors
  console.error("[ERROR]", err);
  return sendError(res, "Internal server error", 500, "INTERNAL_ERROR");
}
