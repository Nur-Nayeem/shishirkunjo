import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role, UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { config } from "../../config/index.js";
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../utils/errors.js";
import { mergeGuestCart } from "../cart/cart.service.js";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./auth.validation.js";

const SALT_ROUNDS = 12;

// In-memory OTP store for MVP (replace with email service in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

function signToken(payload: {
  id: string;
  role: Role;
  email: string;
  name: string;
}) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

function sanitizeUser(user: {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export async function register(input: RegisterInput) {
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingEmail) {
    throw new ConflictError(
      "An account with this email already exists",
      "EMAIL_EXISTS"
    );
  }

  if (input.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: input.phone },
    });
    if (existingPhone) {
      throw new ConflictError(
        "An account with this phone number already exists",
        "PHONE_EXISTS"
      );
    }
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      passwordHash,
      role: Role.CUSTOMER,
    },
  });

  const accessToken = signToken({
    id: user.id,
    role: user.role,
    email: user.email!,
    name: user.name,
  });

  return {
    user: sanitizeUser(user),
    accessToken,
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new ForbiddenError("Your account has been blocked");
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (input.sessionId) {
    try {
      await mergeGuestCart(user.id, input.sessionId);
    } catch {
      // non-fatal
    }
  }

  const accessToken = signToken({
    id: user.id,
    role: user.role,
    email: user.email!,
    name: user.name,
  });

  return {
    user: sanitizeUser(user),
    accessToken,
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new ForbiddenError("Your account has been blocked");
  }

  return user;
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || user.status === UserStatus.BLOCKED) {
    return {
      message: "If this email is registered, an OTP has been sent",
    };
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(input.email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  if (config.env === "development") {
    console.log(`[OTP] ${input.email} → ${otp}`);
  }

  return {
    message: "If this email is registered, an OTP has been sent",
    ...(config.env === "development" && { devOtp: otp }),
  };
}

export async function resetPassword(input: ResetPasswordInput) {
  const key = input.email.toLowerCase();
  const stored = otpStore.get(key);

  if (!stored || stored.expiresAt < Date.now()) {
    throw new ValidationError("OTP expired or invalid");
  }

  if (stored.otp !== input.otp) {
    throw new ValidationError("Invalid OTP");
  }

  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  otpStore.delete(key);

  return { message: "Password reset successful" };
}
