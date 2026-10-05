import { ProductStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ConflictError } from "../../utils/errors.js";

async function getOrCreateWishlist(userId: string) {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
  });
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({ data: { userId } });
  }
  return wishlist;
}

export async function getWishlist(userId: string) {
  const wishlist = await getOrCreateWishlist(userId);

  const items = await prisma.wishlistItem.findMany({
    where: { wishlistId: wishlist.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          regularPrice: true,
          salePrice: true,
          stockQuantity: true,
          status: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter out archived products
  const active = items.filter((i) => i.product.status === ProductStatus.ACTIVE);

  return {
    id: wishlist.id,
    items: active,
    itemCount: active.length,
  };
}

export async function addItem(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== ProductStatus.ACTIVE) {
    throw new NotFoundError("Product not found or unavailable");
  }

  const wishlist = await getOrCreateWishlist(userId);

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: { wishlistId: wishlist.id, productId },
    },
  });

  if (existing) {
    throw new ConflictError("Product already in wishlist", "ALREADY_IN_WISHLIST");
  }

  await prisma.wishlistItem.create({
    data: { wishlistId: wishlist.id, productId },
  });

  return getWishlist(userId);
}

export async function removeItem(userId: string, productId: string) {
  const wishlist = await getOrCreateWishlist(userId);

  await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id, productId },
  });

  return getWishlist(userId);
}
