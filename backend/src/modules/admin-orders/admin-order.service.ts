import {
  OrderStatus,
  PaymentStatus,
  DeliveryStatus,
  DeliveryMethod,
  Prisma,
} from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../utils/errors.js";
import type { OrderListQuery } from "./admin-order.validation.js";

export async function listOrders(query: OrderListQuery) {
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
    deliveryMethod,
    search,
    dateFrom,
    dateTo,
  } = query;

  const where: Prisma.OrderWhereInput = {};

  if (status) where.orderStatus = status as OrderStatus;
  if (paymentStatus) where.paymentStatus = paymentStatus as PaymentStatus;
  if (deliveryMethod) where.deliveryMethod = deliveryMethod as DeliveryMethod;

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search } },
    ];
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        orderStatus: true,
        paymentStatus: true,
        paymentMethod: true,
        deliveryMethod: true,
        subtotal: true,
        deliveryCharge: true,
        discount: true,
        totalAmount: true,
        createdAt: true,
        confirmedAt: true,
        deliveredAt: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
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

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, sku: true },
          },
          variant: {
            select: { id: true, name: true, sku: true },
          },
        },
      },
      address: true,
      payment: true,
      delivery: true,
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  if (!order) throw new NotFoundError("Order not found");

  // Estimated profit (admin only)
  const productCost = order.items.reduce(
    (sum, item) => sum + Number(item.purchasePrice) * item.quantity,
    0
  );
  const estimatedProfit =
    Number(order.totalAmount) -
    productCost -
    Number(order.deliveryCharge) -
    Number(order.discount);

  return {
    ...order,
    estimatedProfit: Math.round(estimatedProfit * 100) / 100,
    productCost: Math.round(productCost * 100) / 100,
  };
}

/**
 * CONFIRM ORDER
 * - Validate PENDING
 * - Re-check stock
 * - Deduct stock
 * - Create inventory SALE transactions
 * - Status → CONFIRMED
 */
export async function confirmOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) throw new NotFoundError("Order not found");
  if (order.orderStatus !== OrderStatus.PENDING) {
    throw new ConflictError(
      `Cannot confirm order in status ${order.orderStatus}`,
      "INVALID_STATUS"
    );
  }

  // Stock check + deduct in transaction
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (!variant || variant.stockQuantity < item.quantity) {
          throw new ConflictError(
            `Insufficient stock for ${item.productName}`,
            "INSUFFICIENT_STOCK"
          );
        }
        const previousStock = variant.stockQuantity;
        const newStock = previousStock - item.quantity;

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: newStock },
        });
        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            type: "SALE",
            quantity: -item.quantity,
            previousStock,
            newStock,
            referenceType: "ORDER",
            referenceId: order.id,
            note: `Order ${order.orderNumber} confirmed`,
          },
        });
      } else {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product || product.stockQuantity < item.quantity) {
          throw new ConflictError(
            `Insufficient stock for ${item.productName}`,
            "INSUFFICIENT_STOCK"
          );
        }
        const previousStock = product.stockQuantity;
        const newStock = previousStock - item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: newStock },
        });
        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantity: -item.quantity,
            previousStock,
            newStock,
            referenceType: "ORDER",
            referenceId: order.id,
            note: `Order ${order.orderNumber} confirmed`,
          },
        });
      }
    }

    await tx.order.update({
      where: { id },
      data: {
        orderStatus: OrderStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    });
  });

  return getOrderById(id);
}

/**
 * CANCEL ORDER
 * - If CONFIRMED or later (stock already deducted) → return stock
 * - If PENDING → just cancel (no stock change)
 */
export async function cancelOrder(id: string, reason?: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) throw new NotFoundError("Order not found");

  const cancellable: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
  ];

  if (!cancellable.includes(order.orderStatus)) {
    throw new ConflictError(
      `Cannot cancel order in status ${order.orderStatus}`,
      "INVALID_STATUS"
    );
  }

  const stockWasDeducted =
    order.orderStatus === OrderStatus.CONFIRMED ||
    order.orderStatus === OrderStatus.PROCESSING;

  await prisma.$transaction(async (tx) => {
    if (stockWasDeducted) {
      for (const item of order.items) {
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
                type: "CANCEL",
                quantity: item.quantity,
                previousStock,
                newStock,
                referenceType: "ORDER",
                referenceId: order.id,
                note: `Order ${order.orderNumber} cancelled${reason ? `: ${reason}` : ""}`,
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
              data: { stockQuantity: newStock },
            });
            await tx.inventoryTransaction.create({
              data: {
                productId: item.productId,
                type: "CANCEL",
                quantity: item.quantity,
                previousStock,
                newStock,
                referenceType: "ORDER",
                referenceId: order.id,
                note: `Order ${order.orderNumber} cancelled${reason ? `: ${reason}` : ""}`,
              },
            });
          }
        }
      }
    }

    await tx.order.update({
      where: { id },
      data: {
        orderStatus: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        notes: reason
          ? `${order.notes || ""}\n[Cancelled] ${reason}`.trim()
          : order.notes,
      },
    });
  });

  return getOrderById(id);
}

export async function markProcessing(id: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new NotFoundError("Order not found");
  if (order.orderStatus !== OrderStatus.CONFIRMED) {
    throw new ConflictError(
      `Order must be CONFIRMED first (current: ${order.orderStatus})`,
      "INVALID_STATUS"
    );
  }

  await prisma.order.update({
    where: { id },
    data: { orderStatus: OrderStatus.PROCESSING },
  });

  return getOrderById(id);
}

export async function assignOwnDelivery(
  id: string,
  data: {
    deliveryPersonName: string;
    deliveryPersonPhone: string;
    notes?: string;
  }
) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { delivery: true },
  });
  if (!order) throw new NotFoundError("Order not found");

  const allowed: OrderStatus[] = [
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
  ];
  if (!allowed.includes(order.orderStatus)) {
    throw new ConflictError(
      `Cannot assign delivery in status ${order.orderStatus}`,
      "INVALID_STATUS"
    );
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: {
        orderStatus: OrderStatus.OUT_FOR_DELIVERY,
        deliveryMethod: DeliveryMethod.OWN,
      },
    }),
    prisma.delivery.update({
      where: { orderId: id },
      data: {
        method: DeliveryMethod.OWN,
        status: DeliveryStatus.OUT_FOR_DELIVERY,
        deliveryPersonName: data.deliveryPersonName,
        deliveryPersonPhone: data.deliveryPersonPhone,
        outForDeliveryAt: new Date(),
        notes: data.notes,
      },
    }),
  ]);

  return getOrderById(id);
}

export async function shipCourier(
  id: string,
  data: {
    courierName: string;
    trackingNumber: string;
    notes?: string;
  }
) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new NotFoundError("Order not found");

  const allowed: OrderStatus[] = [
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
  ];
  if (!allowed.includes(order.orderStatus)) {
    throw new ConflictError(
      `Cannot ship in status ${order.orderStatus}`,
      "INVALID_STATUS"
    );
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: {
        orderStatus: OrderStatus.SHIPPED,
        deliveryMethod: DeliveryMethod.COURIER,
      },
    }),
    prisma.delivery.update({
      where: { orderId: id },
      data: {
        method: DeliveryMethod.COURIER,
        status: DeliveryStatus.SHIPPED,
        courierName: data.courierName,
        trackingNumber: data.trackingNumber,
        shippedAt: new Date(),
        notes: data.notes,
      },
    }),
  ]);

  return getOrderById(id);
}

export async function markOutForDelivery(id: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new NotFoundError("Order not found");

  const allowed: OrderStatus[] = [
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
  ];
  if (!allowed.includes(order.orderStatus)) {
    throw new ConflictError(
      `Cannot mark out for delivery from ${order.orderStatus}`,
      "INVALID_STATUS"
    );
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { orderStatus: OrderStatus.OUT_FOR_DELIVERY },
    }),
    prisma.delivery.update({
      where: { orderId: id },
      data: {
        status: DeliveryStatus.OUT_FOR_DELIVERY,
        outForDeliveryAt: new Date(),
      },
    }),
  ]);

  return getOrderById(id);
}

/**
 * MARK DELIVERED
 * - Order → DELIVERED
 * - Payment → PAID (COD collected)
 * - Delivery → DELIVERED
 */
export async function markDelivered(id: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new NotFoundError("Order not found");

  const allowed: OrderStatus[] = [
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.SHIPPED,
  ];
  if (!allowed.includes(order.orderStatus)) {
    throw new ConflictError(
      `Cannot mark delivered from ${order.orderStatus}`,
      "INVALID_STATUS"
    );
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: {
        orderStatus: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        deliveredAt: now,
      },
    }),
    prisma.payment.update({
      where: { orderId: id },
      data: {
        status: PaymentStatus.PAID,
        paidAt: now,
      },
    }),
    prisma.delivery.update({
      where: { orderId: id },
      data: {
        status: DeliveryStatus.DELIVERED,
        deliveredAt: now,
      },
    }),
  ]);

  return getOrderById(id);
}

export async function markFailedDelivery(id: string, reason: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) throw new NotFoundError("Order not found");

  const allowed: OrderStatus[] = [
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.SHIPPED,
  ];
  if (!allowed.includes(order.orderStatus)) {
    throw new ConflictError(
      `Cannot mark failed from ${order.orderStatus}`,
      "INVALID_STATUS"
    );
  }

  // Return stock on failed delivery
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
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
              type: "RETURN",
              quantity: item.quantity,
              previousStock,
              newStock,
              referenceType: "ORDER",
              referenceId: order.id,
              note: `Failed delivery: ${reason}`,
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
            data: { stockQuantity: newStock },
          });
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: "RETURN",
              quantity: item.quantity,
              previousStock,
              newStock,
              referenceType: "ORDER",
              referenceId: order.id,
              note: `Failed delivery: ${reason}`,
            },
          });
        }
      }
    }

    await tx.order.update({
      where: { id },
      data: {
        orderStatus: OrderStatus.FAILED_DELIVERY,
        notes: `${order.notes || ""}\n[Failed Delivery] ${reason}`.trim(),
      },
    });
    await tx.delivery.update({
      where: { orderId: id },
      data: {
        status: DeliveryStatus.FAILED,
        notes: reason,
      },
    });
  });

  return getOrderById(id);
}

export async function markReturned(id: string, reason?: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) throw new NotFoundError("Order not found");

  if (order.orderStatus !== OrderStatus.DELIVERED) {
    throw new ConflictError(
      "Only delivered orders can be returned",
      "INVALID_STATUS"
    );
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
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
              type: "RETURN",
              quantity: item.quantity,
              previousStock,
              newStock,
              referenceType: "ORDER",
              referenceId: order.id,
              note: `Return${reason ? `: ${reason}` : ""}`,
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
            data: { stockQuantity: newStock },
          });
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: "RETURN",
              quantity: item.quantity,
              previousStock,
              newStock,
              referenceType: "ORDER",
              referenceId: order.id,
              note: `Return${reason ? `: ${reason}` : ""}`,
            },
          });
        }
      }
    }

    await tx.order.update({
      where: { id },
      data: {
        orderStatus: OrderStatus.RETURNED,
        paymentStatus: PaymentStatus.REFUNDED,
        notes: `${order.notes || ""}\n[Returned] ${reason || ""}`.trim(),
      },
    });
    await tx.payment.update({
      where: { orderId: id },
      data: { status: PaymentStatus.REFUNDED },
    });
    await tx.delivery.update({
      where: { orderId: id },
      data: { status: DeliveryStatus.RETURNED },
    });
  });

  return getOrderById(id);
}
