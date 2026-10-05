import { PurchaseStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

interface PurchaseItemInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitCost: number;
}

export async function listPurchases(opts?: {
  page?: number;
  limit?: number;
  supplierId?: string;
}) {
  const page = opts?.page || 1;
  const limit = opts?.limit || 20;

  const where = opts?.supplierId ? { supplierId: opts.supplierId } : {};

  const [items, total] = await Promise.all([
    prisma.purchase.findMany({
      where,
      orderBy: { purchaseDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        supplier: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.purchase.count({ where }),
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

export async function getPurchase(id: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
          variant: { select: { id: true, name: true, sku: true } },
        },
      },
    },
  });
  if (!purchase) throw new NotFoundError("Purchase not found");
  return purchase;
}

/**
 * Create purchase + stock IN in one transaction
 */
export async function createPurchase(data: {
  supplierId: string;
  invoiceNumber?: string;
  purchaseDate: string;
  additionalCost?: number;
  notes?: string;
  items: PurchaseItemInput[];
}) {
  if (!data.items.length) {
    throw new ValidationError("At least one item required");
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id: data.supplierId },
  });
  if (!supplier) throw new NotFoundError("Supplier not found");

  // Validate products exist
  for (const item of data.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!product) {
      throw new NotFoundError(`Product not found: ${item.productId}`);
    }
    if (item.variantId) {
      const variant = await prisma.productVariant.findFirst({
        where: { id: item.variantId, productId: item.productId },
      });
      if (!variant) {
        throw new NotFoundError(`Variant not found: ${item.variantId}`);
      }
    }
  }

  const subtotal = data.items.reduce(
    (sum, i) => sum + i.quantity * i.unitCost,
    0
  );
  const additionalCost = data.additionalCost || 0;
  const totalAmount = subtotal + additionalCost;

  const purchase = await prisma.$transaction(async (tx) => {
    const newPurchase = await tx.purchase.create({
      data: {
        supplierId: data.supplierId,
        invoiceNumber: data.invoiceNumber,
        purchaseDate: new Date(data.purchaseDate),
        subtotal,
        additionalCost,
        totalAmount,
        notes: data.notes,
        status: PurchaseStatus.COMPLETED,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.quantity * item.unitCost,
          })),
        },
      },
      include: {
        items: true,
        supplier: true,
      },
    });

    // Stock IN for each item
    for (const item of data.items) {
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (variant) {
          const previousStock = variant.stockQuantity;
          const newStock = previousStock + item.quantity;
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: newStock },
          });
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              type: "PURCHASE",
              quantity: item.quantity,
              previousStock,
              newStock,
              referenceType: "PURCHASE",
              referenceId: newPurchase.id,
              note: `Purchase from ${supplier.name}`,
            },
          });
        }
      } else {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (product) {
          const previousStock = product.stockQuantity;
          const newStock = previousStock + item.quantity;
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: newStock,
              // Update purchase price to latest cost
              purchasePrice: item.unitCost,
            },
          });
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: "PURCHASE",
              quantity: item.quantity,
              previousStock,
              newStock,
              referenceType: "PURCHASE",
              referenceId: newPurchase.id,
              note: `Purchase from ${supplier.name}`,
            },
          });
        }
      }
    }

    return newPurchase;
  });

  return purchase;
}
