import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ConflictError } from "../../utils/errors.js";

export async function getInventorySummary() {
  const [total, lowStock, outOfStock, products] = await Promise.all([
    prisma.product.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.product.count({
      where: {
        status: { not: "ARCHIVED" },
        stockQuantity: { gt: 0 },
        // low stock: stockQuantity <= lowStockThreshold
      },
    }),
    prisma.product.count({
      where: { status: { not: "ARCHIVED" }, stockQuantity: { lte: 0 } },
    }),
    prisma.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        lowStockThreshold: true,
        purchasePrice: true,
        status: true,
      },
    }),
  ]);

  // Recalculate low stock properly
  const lowStockProducts = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
  );

  const stockValue = products.reduce(
    (sum, p) => sum + Number(p.purchasePrice) * p.stockQuantity,
    0
  );

  return {
    totalProducts: total,
    lowStock: lowStockProducts.length,
    outOfStock,
    stockValue: Math.round(stockValue * 100) / 100,
  };
}

export async function listInventory(opts?: {
  page?: number;
  limit?: number;
  filter?: "all" | "low" | "out";
  search?: string;
}) {
  const page = opts?.page || 1;
  const limit = opts?.limit || 20;

  const where: Prisma.ProductWhereInput = {
    status: { not: "ARCHIVED" },
  };

  if (opts?.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { sku: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  // For low/out we fetch and filter (Prisma can't easily compare two columns)
  const all = await prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      sku: true,
      stockQuantity: true,
      lowStockThreshold: true,
      purchasePrice: true,
      regularPrice: true,
      status: true,
      category: { select: { name: true, slug: true } },
    },
    orderBy: { name: "asc" },
  });

  let filtered = all;
  if (opts?.filter === "low") {
    filtered = all.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
    );
  } else if (opts?.filter === "out") {
    filtered = all.filter((p) => p.stockQuantity <= 0);
  }

  const total = filtered.length;
  const items = filtered.slice((page - 1) * limit, page * limit).map((p) => ({
    ...p,
    stockStatus:
      p.stockQuantity <= 0
        ? "OUT"
        : p.stockQuantity <= p.lowStockThreshold
          ? "LOW"
          : "HEALTHY",
    stockValue: Number(p.purchasePrice) * p.stockQuantity,
  }));

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

export async function getProductHistory(
  productId: string,
  opts?: { page?: number; limit?: number }
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, sku: true, stockQuantity: true },
  });
  if (!product) throw new NotFoundError("Product not found");

  const page = opts?.page || 1;
  const limit = opts?.limit || 50;

  const [items, total] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inventoryTransaction.count({ where: { productId } }),
  ]);

  return {
    product,
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function adjustStock(data: {
  productId: string;
  variantId?: string;
  quantity: number; // can be negative
  reason?: string;
}) {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });
  if (!product) throw new NotFoundError("Product not found");

  if (data.variantId) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: data.variantId, productId: data.productId },
    });
    if (!variant) throw new NotFoundError("Variant not found");

    const previousStock = variant.stockQuantity;
    const newStock = previousStock + data.quantity;
    if (newStock < 0) {
      throw new ConflictError("Insufficient stock", "INSUFFICIENT_STOCK");
    }

    const [updated] = await prisma.$transaction([
      prisma.productVariant.update({
        where: { id: data.variantId },
        data: { stockQuantity: newStock },
      }),
      prisma.inventoryTransaction.create({
        data: {
          productId: data.productId,
          variantId: data.variantId,
          type: data.quantity < 0 ? "DAMAGE" : "ADJUSTMENT",
          quantity: data.quantity,
          previousStock,
          newStock,
          note: data.reason || "Manual adjustment",
        },
      }),
    ]);

    return updated;
  }

  const previousStock = product.stockQuantity;
  const newStock = previousStock + data.quantity;
  if (newStock < 0) {
    throw new ConflictError("Insufficient stock", "INSUFFICIENT_STOCK");
  }

  const [updated] = await prisma.$transaction([
    prisma.product.update({
      where: { id: data.productId },
      data: { stockQuantity: newStock },
    }),
    prisma.inventoryTransaction.create({
      data: {
        productId: data.productId,
        type: data.quantity < 0 ? "DAMAGE" : "ADJUSTMENT",
        quantity: data.quantity,
        previousStock,
        newStock,
        note: data.reason || "Manual adjustment",
      },
    }),
  ]);

  return updated;
}
