import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

interface DateRange {
  dateFrom?: string;
  dateTo?: string;
}

function dateFilter(range: DateRange): Prisma.DateTimeFilter | undefined {
  if (!range.dateFrom && !range.dateTo) return undefined;
  const f: Prisma.DateTimeFilter = {};
  if (range.dateFrom) f.gte = new Date(range.dateFrom);
  if (range.dateTo) f.lte = new Date(range.dateTo);
  return f;
}

export async function salesReport(range: DateRange) {
  const createdAt = dateFilter(range);

  const where: Prisma.OrderWhereInput = {
    orderStatus: {
      notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED],
    },
    ...(createdAt && { createdAt }),
  };

  const [agg, orderCount, items] = await Promise.all([
    prisma.order.aggregate({
      where,
      _sum: {
        subtotal: true,
        deliveryCharge: true,
        discount: true,
        totalAmount: true,
      },
      _count: true,
    }),
    prisma.order.count({ where }),
    prisma.orderItem.aggregate({
      where: { order: where },
      _sum: { quantity: true },
    }),
  ]);

  return {
    orders: orderCount,
    quantity: items._sum.quantity || 0,
    grossSales: Number(agg._sum.subtotal || 0),
    discounts: Number(agg._sum.discount || 0),
    delivery: Number(agg._sum.deliveryCharge || 0),
    netSales: Number(agg._sum.totalAmount || 0),
  };
}

export async function ordersReport(range: DateRange) {
  const createdAt = dateFilter(range);
  const where = createdAt ? { createdAt } : {};

  const statuses = await prisma.order.groupBy({
    by: ["orderStatus"],
    where,
    _count: true,
  });

  const map: Record<string, number> = {};
  let total = 0;
  for (const s of statuses) {
    map[s.orderStatus] = s._count;
    total += s._count;
  }

  return {
    total,
    pending: map.PENDING || 0,
    confirmed: map.CONFIRMED || 0,
    processing: map.PROCESSING || 0,
    delivered: map.DELIVERED || 0,
    cancelled: map.CANCELLED || 0,
    returned: map.RETURNED || 0,
    failedDelivery: map.FAILED_DELIVERY || 0,
    byStatus: map,
  };
}

export async function productsReport(range: DateRange) {
  const createdAt = dateFilter(range);

  const top = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: createdAt
      ? { order: { createdAt, orderStatus: { not: OrderStatus.CANCELLED } } }
      : { order: { orderStatus: { not: OrderStatus.CANCELLED } } },
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 20,
  });

  const productIds = top.map((t) => t.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true, slug: true },
  });
  const nameMap = new Map(products.map((p) => [p.id, p]));

  return {
    items: top.map((t) => ({
      product: nameMap.get(t.productId),
      quantitySold: t._sum.quantity || 0,
      revenue: Number(t._sum.total || 0),
    })),
  };
}

export async function inventoryReport() {
  const products = await prisma.product.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: {
      id: true,
      name: true,
      sku: true,
      stockQuantity: true,
      lowStockThreshold: true,
      purchasePrice: true,
    },
  });

  const low = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
  );
  const out = products.filter((p) => p.stockQuantity <= 0);
  const stockValue = products.reduce(
    (s, p) => s + Number(p.purchasePrice) * p.stockQuantity,
    0
  );

  return {
    totalProducts: products.length,
    lowStock: low.length,
    outOfStock: out.length,
    stockValue: Math.round(stockValue * 100) / 100,
    lowStockItems: low.slice(0, 20),
    outOfStockItems: out.slice(0, 20),
  };
}

export async function purchasesReport(range: DateRange) {
  const purchaseDate = dateFilter(range);
  const where = purchaseDate ? { purchaseDate } : {};

  const [agg, bySupplier] = await Promise.all([
    prisma.purchase.aggregate({
      where,
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.purchase.groupBy({
      by: ["supplierId"],
      where,
      _sum: { totalAmount: true },
      _count: true,
    }),
  ]);

  const supplierIds = bySupplier.map((s) => s.supplierId);
  const suppliers = await prisma.supplier.findMany({
    where: { id: { in: supplierIds } },
    select: { id: true, name: true },
  });
  const nameMap = new Map(suppliers.map((s) => [s.id, s.name]));

  return {
    totalPurchases: agg._count,
    totalAmount: Number(agg._sum.totalAmount || 0),
    bySupplier: bySupplier.map((s) => ({
      supplierId: s.supplierId,
      supplierName: nameMap.get(s.supplierId),
      count: s._count,
      amount: Number(s._sum.totalAmount || 0),
    })),
  };
}

export async function customersReport(range: DateRange) {
  const createdAt = dateFilter(range);

  const newCustomers = await prisma.user.count({
    where: {
      role: "CUSTOMER",
      ...(createdAt && { createdAt }),
    },
  });

  const totalCustomers = await prisma.user.count({
    where: { role: "CUSTOMER" },
  });

  // Top customers by spend
  const topSpenders = await prisma.order.groupBy({
    by: ["userId"],
    where: {
      userId: { not: null },
      orderStatus: { notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED] },
      ...(createdAt && { createdAt }),
    },
    _sum: { totalAmount: true },
    _count: true,
    orderBy: { _sum: { totalAmount: "desc" } },
    take: 10,
  });

  const userIds = topSpenders
    .map((t) => t.userId)
    .filter((id): id is string => id !== null);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, phone: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return {
    totalCustomers,
    newCustomers,
    topCustomers: topSpenders.map((t) => ({
      user: t.userId ? userMap.get(t.userId) : null,
      orderCount: t._count,
      totalSpent: Number(t._sum.totalAmount || 0),
    })),
  };
}

export async function profitReport(range: DateRange) {
  const createdAt = dateFilter(range);

  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        orderStatus: OrderStatus.DELIVERED,
        ...(createdAt && { deliveredAt: createdAt }),
      },
    },
    select: {
      quantity: true,
      unitPrice: true,
      purchasePrice: true,
      total: true,
      discount: true,
    },
  });

  const orders = await prisma.order.findMany({
    where: {
      orderStatus: OrderStatus.DELIVERED,
      ...(createdAt && { deliveredAt: createdAt }),
    },
    select: {
      deliveryCharge: true,
      discount: true,
      totalAmount: true,
    },
  });

  const revenue = items.reduce((s, i) => s + Number(i.total), 0);
  const productCost = items.reduce(
    (s, i) => s + Number(i.purchasePrice) * i.quantity,
    0
  );
  const discounts = orders.reduce((s, o) => s + Number(o.discount), 0);
  const deliveryCost = orders.reduce(
    (s, o) => s + Number(o.deliveryCharge),
    0
  );
  // For COD own delivery, delivery charge is revenue not cost;
  // estimated profit = revenue - productCost (delivery is paid by customer)
  const estimatedProfit = revenue - productCost;

  return {
    revenue: Math.round(revenue * 100) / 100,
    productCost: Math.round(productCost * 100) / 100,
    discounts: Math.round(discounts * 100) / 100,
    deliveryCollected: Math.round(deliveryCost * 100) / 100,
    estimatedProfit: Math.round(estimatedProfit * 100) / 100,
    orderCount: orders.length,
  };
}
