import { Response } from "express";

interface SuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data?: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  error?: {
    code?: string;
    details?: unknown;
  };
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200
) {
  const body: SuccessResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  code?: string,
  details?: unknown
) {
  const body: ErrorResponse = {
    success: false,
    message,
    ...(code || details
      ? {
          error: {
            ...(code && { code }),
            ...(details && { details }),
          },
        }
      : {}),
  };
  return res.status(statusCode).json(body);
}
