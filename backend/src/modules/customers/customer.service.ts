import { Role, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../utils/errors.js";

export async function listCustomers(opts?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = opts?.page || 1;
  const limit = opts?.limit || 20;

  const where: Prisma.UserWhereInput = { role: Role.CUSTOMER };
  if (opts?.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { email: { contains: opts.search, mode: "insensitive" } },
      { phone: { contains: opts.search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Attach total spent
  const withSpent = await Promise.all(
    items.map(async (u) => {
      const spent = await prisma.order.aggregate({
        where: {
          userId: u.id,
          orderStatus: { notIn: ["CANCELLED", "RETURNED"] },
        },
        _sum: { totalAmount: true },
      });
      return {
        ...u,
        orderCount: u._count.orders,
        totalSpent: Number(spent._sum.totalAmount || 0),
      };
    })
  );

  return {
    items: withSpent,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCustomer(id: string) {
  const user = await prisma.user.findFirst({
    where: { id, role: Role.CUSTOMER },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) throw new NotFoundError("Customer not found");

  const spent = await prisma.order.aggregate({
    where: {
      userId: id,
      orderStatus: { notIn: ["CANCELLED", "RETURNED"] },
    },
    _sum: { totalAmount: true },
  });

  return {
    ...user,
    totalSpent: Number(spent._sum.totalAmount || 0),
  };
}

export async function updateCustomerStatus(
  id: string,
  status: "ACTIVE" | "BLOCKED"
) {
  const user = await prisma.user.findFirst({
    where: { id, role: Role.CUSTOMER },
  });
  if (!user) throw new NotFoundError("Customer not found");

  return prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
    },
  });
}
