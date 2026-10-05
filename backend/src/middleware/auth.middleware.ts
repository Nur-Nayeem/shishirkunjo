import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { config } from "../config/index.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

interface JwtPayload {
  id: string;
  role: Role;
  email: string;
  name: string;
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookieToken = (req as Request & { cookies?: Record<string, string> })
    .cookies?.token;
  return cookieToken || null;
}

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        name: decoded.name,
      };
      next();
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }
);

export const requireAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }
    if (req.user.role !== Role.ADMIN) {
      throw new ForbiddenError("Admin access required");
    }
    next();
  }
);

export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) {
      return next();
    }
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        name: decoded.name,
      };
    } catch {
      // ignore invalid token for optional auth
    }
    next();
  }
);
