import { ProductStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ConflictError, ValidationError } from "../../utils/errors.js";
import type { AddCartItemInput } from "./cart.validation.js";

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }
    return cart;
  }

  if (!sessionId) {
    throw new ValidationError("sessionId is required for guest cart");
  }

  let cart = await prisma.cart.findFirst({
    where: { sessionId },
    include: { items: true },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: { items: true },
    });
  }
  return cart;
}

async function loadCart(cartId: string) {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
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
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              stockQuantity: true,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

function sellingPrice(
  regularPrice: { toNumber?: () => number } | number,
  salePrice: { toNumber?: () => number } | number | null
) {
  const regular =
    typeof regularPrice === "number" ? regularPrice : Number(regularPrice);
  const sale =
    salePrice === null || salePrice === undefined
      ? null
      : typeof salePrice === "number"
        ? salePrice
        : Number(salePrice);
  if (sale !== null && sale < regular) return sale;
  return regular;
}

export async function getCart(userId?: string, sessionId?: string) {
  const cart = await getOrCreateCart(userId, sessionId);
  const full = await loadCart(cart.id);

  const items = (full?.items || []).map((item) => {
    const unitPrice = item.variant?.price
      ? Number(item.variant.price)
      : sellingPrice(item.product.regularPrice, item.product.salePrice);

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      product: item.product,
      variant: item.variant,
      unitPrice,
      subtotal: unitPrice * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal,
  };
}

export async function addItem(
  input: AddCartItemInput,
  userId?: string,
  sessionId?: string
) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
  });

  if (!product || product.status !== ProductStatus.ACTIVE) {
    throw new NotFoundError("Product not found or unavailable");
  }

  let availableStock = product.stockQuantity;

  if (input.variantId) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: input.variantId, productId: input.productId, isActive: true },
    });
    if (!variant) {
      throw new NotFoundError("Variant not found");
    }
    availableStock = variant.stockQuantity;
  }

  if (availableStock < input.quantity) {
    throw new ConflictError("Insufficient stock", "INSUFFICIENT_STOCK");
  }

  const cart = await getOrCreateCart(userId, sessionId);

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: input.productId,
      variantId: input.variantId ?? null,
    },
  });

  if (existing) {
    const newQty = existing.quantity + input.quantity;
    if (availableStock < newQty) {
      throw new ConflictError("Insufficient stock", "INSUFFICIENT_STOCK");
    }
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId ?? null,
        quantity: input.quantity,
      },
    });
  }

  return getCart(userId, sessionId);
}

export async function updateItem(
  itemId: string,
  quantity: number,
  userId?: string,
  sessionId?: string
) {
  const cart = await getOrCreateCart(userId, sessionId);

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: true, variant: true },
  });

  if (!item) {
    throw new NotFoundError("Cart item not found");
  }

  const availableStock = item.variant
    ? item.variant.stockQuantity
    : item.product.stockQuantity;

  if (availableStock < quantity) {
    throw new ConflictError("Insufficient stock", "INSUFFICIENT_STOCK");
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return getCart(userId, sessionId);
}

export async function removeItem(
  itemId: string,
  userId?: string,
  sessionId?: string
) {
  const cart = await getOrCreateCart(userId, sessionId);

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });

  if (!item) {
    throw new NotFoundError("Cart item not found");
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(userId, sessionId);
}

export async function clearCart(userId?: string, sessionId?: string) {
  const cart = await getOrCreateCart(userId, sessionId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return getCart(userId, sessionId);
}

/** Merge guest cart into user cart after login */
export async function mergeGuestCart(userId: string, sessionId: string) {
  const guestCart = await prisma.cart.findFirst({
    where: { sessionId },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) return;

  const userCart = await getOrCreateCart(userId);

  for (const item of guestCart.items) {
    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        productId: item.productId,
        variantId: item.variantId,
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        },
      });
    }
  }

  await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
  await prisma.cart.delete({ where: { id: guestCart.id } });
}
