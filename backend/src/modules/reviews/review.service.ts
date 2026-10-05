import { ReviewStatus, OrderStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  ValidationError,
} from "../../utils/errors.js";

export async function listPublicReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId, status: ReviewStatus.APPROVED },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });
}

export async function createReview(
  userId: string,
  productId: string,
  data: { orderId: string; rating: number; comment?: string }
) {
  if (data.rating < 1 || data.rating > 5) {
    throw new ValidationError("Rating must be between 1 and 5");
  }

  // Must own a delivered order containing this product
  const order = await prisma.order.findFirst({
    where: {
      id: data.orderId,
      userId,
      orderStatus: OrderStatus.DELIVERED,
      items: { some: { productId } },
    },
  });

  if (!order) {
    throw new ForbiddenError(
      "You can only review products from your delivered orders"
    );
  }

  const existing = await prisma.review.findUnique({
    where: {
      userId_productId_orderId: {
        userId,
        productId,
        orderId: data.orderId,
      },
    },
  });

  if (existing) {
    throw new ConflictError("You already reviewed this product for this order");
  }

  return prisma.review.create({
    data: {
      userId,
      productId,
      orderId: data.orderId,
      rating: data.rating,
      comment: data.comment,
      status: ReviewStatus.PENDING,
    },
  });
}

// Admin
export async function listAdminReviews(opts?: {
  status?: ReviewStatus;
  page?: number;
  limit?: number;
}) {
  const page = opts?.page || 1;
  const limit = opts?.limit || 20;
  const where = opts?.status ? { status: opts.status } : {};

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function moderateReview(
  id: string,
  status: "APPROVED" | "REJECTED"
) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new NotFoundError("Review not found");

  return prisma.review.update({
    where: { id },
    data: { status: status as ReviewStatus },
  });
}

export async function deleteReview(id: string) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new NotFoundError("Review not found");
  await prisma.review.delete({ where: { id } });
  return { deleted: true };
}
