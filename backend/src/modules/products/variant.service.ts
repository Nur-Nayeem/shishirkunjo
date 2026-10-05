import { prisma } from "../../lib/prisma.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import type { CreateVariantInput, UpdateVariantInput } from "./variant.validation.js";

async function ensureProduct(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError("Product not found");
  return product;
}

export async function listVariants(productId: string) {
  await ensureProduct(productId);
  return prisma.productVariant.findMany({
    where: { productId },
    orderBy: { name: "asc" },
  });
}

export async function createVariant(
  productId: string,
  input: CreateVariantInput
) {
  await ensureProduct(productId);

  const skuExists = await prisma.productVariant.findUnique({
    where: { sku: input.sku },
  });
  if (skuExists) {
    throw new ConflictError("Variant SKU already exists", "SKU_EXISTS");
  }

  // Also check against product SKUs
  const productSku = await prisma.product.findUnique({
    where: { sku: input.sku },
  });
  if (productSku) {
    throw new ConflictError("SKU conflicts with a product SKU", "SKU_EXISTS");
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      name: input.name,
      sku: input.sku,
      price: input.price ?? null,
      purchasePrice: input.purchasePrice ?? null,
      stockQuantity: input.stockQuantity ?? 0,
      weight: input.weight ?? null,
      isActive: input.isActive ?? true,
    },
  });

  if ((input.stockQuantity ?? 0) > 0) {
    await prisma.inventoryTransaction.create({
      data: {
        productId,
        variantId: variant.id,
        type: "ADJUSTMENT",
        quantity: input.stockQuantity!,
        previousStock: 0,
        newStock: input.stockQuantity!,
        note: "Initial variant stock",
      },
    });
  }

  return variant;
}

export async function updateVariant(
  productId: string,
  variantId: string,
  input: UpdateVariantInput
) {
  await ensureProduct(productId);

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
  });
  if (!variant) throw new NotFoundError("Variant not found");

  if (input.sku) {
    const existing = await prisma.productVariant.findFirst({
      where: { sku: input.sku, NOT: { id: variantId } },
    });
    if (existing) {
      throw new ConflictError("Variant SKU already exists", "SKU_EXISTS");
    }
  }

  return prisma.productVariant.update({
    where: { id: variantId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.sku !== undefined && { sku: input.sku }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.purchasePrice !== undefined && {
        purchasePrice: input.purchasePrice,
      }),
      ...(input.stockQuantity !== undefined && {
        stockQuantity: input.stockQuantity,
      }),
      ...(input.weight !== undefined && { weight: input.weight }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
}

export async function deleteVariant(productId: string, variantId: string) {
  await ensureProduct(productId);

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, productId },
  });
  if (!variant) throw new NotFoundError("Variant not found");

  // Soft deactivate instead of hard delete
  return prisma.productVariant.update({
    where: { id: variantId },
    data: { isActive: false },
  });
}
