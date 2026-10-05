import { OrderStatus, PaymentStatus, ProductStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function getDashboard() {
  const today = startOfDay();
  const monthStart = startOfMonth();

  const [
    todayOrders,
    todaySalesAgg,
    monthSalesAgg,
    pendingCount,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    outOfStock,
    recentOrders,
    topProductsRaw,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: { gte: today },
        orderStatus: { not: OrderStatus.CANCELLED },
      },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: today },
        orderStatus: { notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED] },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: monthStart },
        orderStatus: { notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED] },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({
      where: { orderStatus: OrderStatus.PENDING },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({
      where: { status: { not: ProductStatus.ARCHIVED } },
    }),
    prisma.product.findMany({
      where: { status: { not: ProductStatus.ARCHIVED } },
      select: {
        id: true,
        stockQuantity: true,
        lowStockThreshold: true,
        purchasePrice: true,
      },
    }),
    prisma.product.count({
      where: {
        status: { not: ProductStatus.ARCHIVED },
        stockQuantity: { lte: 0 },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const lowStock = lowStockProducts.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
  ).length;

  // Estimated profit this month (delivered orders only for accuracy)
  const deliveredItems = await prisma.orderItem.findMany({
    where: {
      order: {
        orderStatus: OrderStatus.DELIVERED,
        deliveredAt: { gte: monthStart },
      },
    },
    select: {
      quantity: true,
      unitPrice: true,
      purchasePrice: true,
      total: true,
    },
  });

  const monthRevenue = deliveredItems.reduce(
    (s, i) => s + Number(i.total),
    0
  );
  const monthCost = deliveredItems.reduce(
    (s, i) => s + Number(i.purchasePrice) * i.quantity,
    0
  );
  const estimatedProfit = monthRevenue - monthCost;

  // Top products with names
  const topProductIds = topProductsRaw.map((t) => t.productId);
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, sku: true, slug: true },
  });
  const nameMap = new Map(topProductDetails.map((p) => [p.id, p]));

  const topProducts = topProductsRaw.map((t) => ({
    product: nameMap.get(t.productId) || { id: t.productId },
    quantitySold: t._sum.quantity || 0,
    revenue: Number(t._sum.total || 0),
  }));

  // Sales last 7 days for chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentSales = await prisma.order.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
      orderStatus: { notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED] },
    },
    select: { createdAt: true, totalAmount: true },
  });

  const salesByDay: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    salesByDay[key] = 0;
  }
  for (const o of recentSales) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (key in salesByDay) {
      salesByDay[key] += Number(o.totalAmount);
    }
  }

  return {
    sales: {
      today: Number(todaySalesAgg._sum.totalAmount || 0),
      month: Number(monthSalesAgg._sum.totalAmount || 0),
    },
    orders: {
      today: todayOrders,
      pending: pendingCount,
    },
    products: {
      total: totalProducts,
      lowStock,
      outOfStock,
    },
    customers: {
      total: totalCustomers,
    },
    profit: {
      estimated: Math.round(estimatedProfit * 100) / 100,
      period: "month",
    },
    charts: {
      salesLast7Days: Object.entries(salesByDay).map(([date, amount]) => ({
        date,
        amount: Math.round(amount * 100) / 100,
      })),
    },
    recentOrders,
    topProducts,
  };
}
