import { CouponType } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

export async function validateCoupon(code: string, cartTotal: number) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    throw new NotFoundError("Invalid coupon code");
  }

  const now = new Date();
  if (coupon.startDate && coupon.startDate > now) {
    throw new ValidationError("Coupon is not yet active");
  }
  if (coupon.endDate && coupon.endDate < now) {
    throw new ValidationError("Coupon has expired");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ValidationError("Coupon usage limit reached");
  }

  if (
    coupon.minimumOrderAmount !== null &&
    cartTotal < Number(coupon.minimumOrderAmount)
  ) {
    throw new ValidationError(
      `Minimum order amount ৳${Number(coupon.minimumOrderAmount)} required`
    );
  }

  let discount = 0;
  if (coupon.type === CouponType.FIXED) {
    discount = Number(coupon.value);
  } else {
    discount = (cartTotal * Number(coupon.value)) / 100;
    if (coupon.maximumDiscount !== null) {
      discount = Math.min(discount, Number(coupon.maximumDiscount));
    }
  }

  // Discount cannot exceed cart total
  discount = Math.min(discount, cartTotal);
  discount = Math.round(discount * 100) / 100;

  return {
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    discountAmount: discount,
    couponId: coupon.id,
  };
}
