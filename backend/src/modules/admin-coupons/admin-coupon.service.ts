import { CouponType } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ConflictError } from "../../utils/errors.js";

export async function listCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCoupon(id: string) {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: {
      _count: { select: { usages: true } },
    },
  });
  if (!coupon) throw new NotFoundError("Coupon not found");
  return coupon;
}

export async function createCoupon(data: {
  code: string;
  type: "FIXED" | "PERCENTAGE";
  value: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}) {
  const code = data.code.toUpperCase();
  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) {
    throw new ConflictError("Coupon code already exists", "CODE_EXISTS");
  }

  return prisma.coupon.create({
    data: {
      code,
      type: data.type as CouponType,
      value: data.value,
      minimumOrderAmount: data.minimumOrderAmount,
      maximumDiscount: data.maximumDiscount,
      usageLimit: data.usageLimit,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateCoupon(
  id: string,
  data: Partial<{
    code: string;
    type: "FIXED" | "PERCENTAGE";
    value: number;
    minimumOrderAmount: number | null;
    maximumDiscount: number | null;
    usageLimit: number | null;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
  }>
) {
  await getCoupon(id);

  if (data.code) {
    const code = data.code.toUpperCase();
    const existing = await prisma.coupon.findFirst({
      where: { code, NOT: { id } },
    });
    if (existing) {
      throw new ConflictError("Coupon code already exists", "CODE_EXISTS");
    }
  }

  return prisma.coupon.update({
    where: { id },
    data: {
      ...(data.code !== undefined && { code: data.code.toUpperCase() }),
      ...(data.type !== undefined && { type: data.type as CouponType }),
      ...(data.value !== undefined && { value: data.value }),
      ...(data.minimumOrderAmount !== undefined && {
        minimumOrderAmount: data.minimumOrderAmount,
      }),
      ...(data.maximumDiscount !== undefined && {
        maximumDiscount: data.maximumDiscount,
      }),
      ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit }),
      ...(data.startDate !== undefined && {
        startDate: data.startDate ? new Date(data.startDate) : null,
      }),
      ...(data.endDate !== undefined && {
        endDate: data.endDate ? new Date(data.endDate) : null,
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function deleteCoupon(id: string) {
  await getCoupon(id);
  return prisma.coupon.update({
    where: { id },
    data: { isActive: false },
  });
}
