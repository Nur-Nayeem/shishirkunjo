import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as authService from "./auth.service.js";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./auth.validation.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;
  const result = await authService.register(input);
  return sendSuccess(res, result, "Registration successful", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  if (!input.sessionId && req.headers["x-session-id"]) {
    input.sessionId = req.headers["x-session-id"] as string;
  }
  const result = await authService.login(input);
  return sendSuccess(res, result, "Login successful");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  return sendSuccess(res, { user }, "User fetched successfully");
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, null, "Logout successful");
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const input = req.body as ForgotPasswordInput;
    const result = await authService.forgotPassword(input);
    return sendSuccess(res, result);
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const input = req.body as ResetPasswordInput;
    const result = await authService.resetPassword(input);
    return sendSuccess(res, result, "Password reset successful");
  }
);
