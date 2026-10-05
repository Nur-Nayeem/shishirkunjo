import {
  ProductStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  DeliveryMethod,
  Prisma,
} from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
} from "../../utils/errors.js";
import { calculateDeliveryCharge } from "../delivery/delivery.service.js";
import { validateCoupon } from "../coupons/coupon.service.js";
import type { CreateOrderInput } from "./order.validation.js";

function sellingPrice(
  regularPrice: Prisma.Decimal,
  salePrice: Prisma.Decimal | null
): number {
  const regular = Number(regularPrice);
  const sale = salePrice !== null ? Number(salePrice) : null;
  if (sale !== null && sale < regular) return sale;
  return regular;
}

async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  // Count today's orders for sequence
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const count = await prisma.order.count({
    where: { createdAt: { gte: startOfDay } },
  });

  const seq = String(count + 1).padStart(4, "0");
  return `SK-${datePart}-${seq}`;
}

interface ResolvedItem {
  productId: string;
  variantId: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
  subtotal: number;
  total: number;
  stockAvailable: number;
}

async function resolveItems(
  items: CreateOrderInput["items"]
): Promise<ResolvedItem[]> {
  const resolved: ResolvedItem[] = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: {
        variants: item.variantId
          ? { where: { id: item.variantId } }
          : false,
      },
    });

    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundError(`Product not found: ${item.productId}`);
    }

    let unitPrice = sellingPrice(product.regularPrice, product.salePrice);
    let purchasePrice = Number(product.purchasePrice);
    let sku = product.sku;
    let stockAvailable = product.stockQuantity;
    let productName = product.name;

    if (item.variantId) {
      const variant = await prisma.productVariant.findFirst({
        where: {
          id: item.variantId,
          productId: item.productId,
          isActive: true,
        },
      });
      if (!variant) {
        throw new NotFoundError(`Variant not found: ${item.variantId}`);
      }
      if (variant.price !== null) unitPrice = Number(variant.price);
      if (variant.purchasePrice !== null)
        purchasePrice = Number(variant.purchasePrice);
      sku = variant.sku;
      stockAvailable = variant.stockQuantity;
      productName = `${product.name} (${variant.name})`;
    }

    if (stockAvailable < item.quantity) {
      throw new ConflictError(
        `Insufficient stock for ${productName}`,
        "INSUFFICIENT_STOCK"
      );
    }

    const subtotal = unitPrice * item.quantity;

    resolved.push({
      productId: product.id,
      variantId: item.variantId ?? null,
      productName,
      sku,
      quantity: item.quantity,
      unitPrice,
      purchasePrice,
      subtotal,
      total: subtotal,
      stockAvailable,
    });
  }

  return resolved;
}

export async function validateCheckout(
  input: CreateOrderInput,
  userId?: string
) {
  const resolvedItems = await resolveItems(input.items);
  const subtotal = resolvedItems.reduce((s, i) => s + i.subtotal, 0);

  // Resolve address
  let district: string;
  if (input.addressId && userId) {
    const addr = await prisma.address.findUnique({
      where: { id: input.addressId },
    });
    if (!addr || addr.userId !== userId) {
      throw new NotFoundError("Address not found");
    }
    district = addr.district;
  } else if (input.address) {
    district = input.address.district;
  } else {
    throw new ValidationError("Address is required");
  }

  const delivery = await calculateDeliveryCharge(district);

  let discount = 0;
  let couponResult = null;
  if (input.couponCode) {
    couponResult = await validateCoupon(input.couponCode, subtotal);
    discount = couponResult.discountAmount;
  }

  // Minimum order check
  const minSetting = await prisma.setting.findUnique({
    where: { key: "minimum_order_amount" },
  });
  const minOrder = minSetting ? Number(minSetting.value) : 0;
  if (minOrder > 0 && subtotal < minOrder) {
    throw new ValidationError(`Minimum order amount is ৳${minOrder}`);
  }

  // Free delivery threshold
  const freeSetting = await prisma.setting.findUnique({
    where: { key: "free_delivery_threshold" },
  });
  const freeThreshold = freeSetting ? Number(freeSetting.value) : 0;
  let deliveryCharge = delivery.charge;
  if (freeThreshold > 0 && subtotal >= freeThreshold) {
    deliveryCharge = 0;
  }

  const totalAmount = subtotal + deliveryCharge - discount;

  return {
    items: resolvedItems.map(({ stockAvailable: _, ...rest }) => rest),
    subtotal,
    deliveryCharge,
    discount,
    totalAmount,
    deliveryMethod: delivery.method,
    zone: delivery.zone,
    coupon: couponResult,
    valid: true,
  };
}

export async function createOrder(input: CreateOrderInput, userId?: string) {
  // Re-validate everything inside transaction-ready flow
  const resolvedItems = await resolveItems(input.items);
  const subtotal = resolvedItems.reduce((s, i) => s + i.subtotal, 0);

  // Address resolution
  let addressData: {
    fullName: string;
    phone: string;
    district: string;
    area: string;
    addressLine: string;
    postalCode?: string | null;
    deliveryNote?: string | null;
  };

  if (input.addressId && userId) {
    const addr = await prisma.address.findUnique({
      where: { id: input.addressId },
    });
    if (!addr || addr.userId !== userId) {
      throw new NotFoundError("Address not found");
    }
    addressData = {
      fullName: addr.fullName,
      phone: addr.phone,
      district: addr.district,
      area: addr.area,
      addressLine: addr.addressLine,
      postalCode: addr.postalCode,
      deliveryNote: addr.deliveryNote,
    };
  } else if (input.address) {
    addressData = input.address;
  } else {
    throw new ValidationError("Address is required");
  }

  const customerName =
    input.customerName || addressData.fullName;
  const customerPhone =
    input.customerPhone || addressData.phone;
  const customerEmail = input.customerEmail || null;

  const delivery = await calculateDeliveryCharge(addressData.district);

  let discount = 0;
  let couponId: string | null = null;
  let couponCode: string | null = null;

  if (input.couponCode) {
    const couponResult = await validateCoupon(input.couponCode, subtotal);
    discount = couponResult.discountAmount;
    couponId = couponResult.couponId;
    couponCode = couponResult.code;
  }

  // Free delivery
  const freeSetting = await prisma.setting.findUnique({
    where: { key: "free_delivery_threshold" },
  });
  const freeThreshold = freeSetting ? Number(freeSetting.value) : 0;
  let deliveryCharge = delivery.charge;
  if (freeThreshold > 0 && subtotal >= freeThreshold) {
    deliveryCharge = 0;
  }

  // Minimum order
  const minSetting = await prisma.setting.findUnique({
    where: { key: "minimum_order_amount" },
  });
  const minOrder = minSetting ? Number(minSetting.value) : 0;
  if (minOrder > 0 && subtotal < minOrder) {
    throw new ValidationError(`Minimum order amount is ৳${minOrder}`);
  }

  const totalAmount = subtotal + deliveryCharge - discount;
  const orderNumber = await generateOrderNumber();

  // Create everything in a transaction
  // NOTE: Stock is NOT deducted here — only on Admin Confirm (per business rules)
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        customerName,
        customerPhone,
        customerEmail,
        subtotal,
        deliveryCharge,
        discount,
        totalAmount,
        paymentMethod: PaymentMethod.COD,
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: OrderStatus.PENDING,
        deliveryMethod: delivery.method as DeliveryMethod,
        notes: input.notes,
        couponCode,
        items: {
          create: resolvedItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            purchasePrice: item.purchasePrice,
            discount: 0,
            subtotal: item.subtotal,
            total: item.total,
          })),
        },
        address: {
          create: {
            fullName: addressData.fullName,
            phone: addressData.phone,
            district: addressData.district,
            area: addressData.area,
            addressLine: addressData.addressLine,
            postalCode: addressData.postalCode,
            deliveryNote: addressData.deliveryNote,
          },
        },
        payment: {
          create: {
            method: PaymentMethod.COD,
            status: PaymentStatus.PENDING,
            amount: totalAmount,
          },
        },
        delivery: {
          create: {
            method: delivery.method as DeliveryMethod,
            status: "PENDING",
          },
        },
      },
      include: {
        items: true,
        address: true,
        payment: true,
        delivery: true,
      },
    });

    // Coupon usage
    if (couponId && userId) {
      await tx.couponUsage.create({
        data: {
          couponId,
          userId,
          orderId: newOrder.id,
          discountAmount: discount,
        },
      });
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Clear cart if logged in
    if (userId) {
      const cart = await tx.cart.findFirst({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    return newOrder;
  });

  return {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      deliveryCharge: Number(order.deliveryCharge),
      discount: Number(order.discount),
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
    },
  };
}

export async function getCustomerOrders(
  userId: string,
  opts?: { page?: number; limit?: number; status?: string }
) {
  const page = opts?.page || 1;
  const limit = opts?.limit || 10;

  const where: Prisma.OrderWhereInput = { userId };
  if (opts?.status) {
    where.orderStatus = opts.status as OrderStatus;
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
        orderStatus: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
        items: {
          select: {
            productName: true,
            quantity: true,
            unitPrice: true,
          },
        },
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

export async function getCustomerOrder(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      address: true,
      payment: true,
      delivery: true,
    },
  });

  if (!order) throw new NotFoundError("Order not found");
  if (order.userId !== userId) throw new ForbiddenError("Not your order");

  return order;
}

export async function getOrderTracking(userId: string, orderId: string) {
  const order = await getCustomerOrder(userId, orderId);

  const statusFlow: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
  ];

  // Handle cancelled/returned/failed
  if (
    order.orderStatus === OrderStatus.CANCELLED ||
    order.orderStatus === OrderStatus.RETURNED ||
    order.orderStatus === OrderStatus.FAILED_DELIVERY
  ) {
    return {
      currentStatus: order.orderStatus,
      timeline: [
        { status: OrderStatus.PENDING, completed: true },
        { status: order.orderStatus, completed: true },
      ],
      order: {
        orderNumber: order.orderNumber,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
      },
    };
  }

  const currentIdx = statusFlow.indexOf(order.orderStatus);

  const timeline = statusFlow.map((status, idx) => ({
    status,
    completed: idx <= currentIdx,
  }));

  return {
    currentStatus: order.orderStatus,
    timeline,
    order: {
      orderNumber: order.orderNumber,
      totalAmount: Number(order.totalAmount),
      deliveryMethod: order.deliveryMethod,
      createdAt: order.createdAt,
      address: order.address,
      items: order.items,
    },
  };
}
