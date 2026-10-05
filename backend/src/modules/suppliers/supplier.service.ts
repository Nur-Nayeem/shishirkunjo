import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../utils/errors.js";

export async function listSuppliers() {
  return prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { purchases: true } },
    },
  });
}

export async function getSupplier(id: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      purchases: {
        orderBy: { purchaseDate: "desc" },
        take: 20,
        include: {
          items: {
            include: {
              product: { select: { name: true, sku: true } },
            },
          },
        },
      },
      _count: { select: { purchases: true } },
    },
  });
  if (!supplier) throw new NotFoundError("Supplier not found");
  return supplier;
}

export async function createSupplier(data: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}) {
  return prisma.supplier.create({ data });
}

export async function updateSupplier(
  id: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    status?: string;
  }
) {
  await getSupplier(id);
  return prisma.supplier.update({ where: { id }, data });
}

export async function deleteSupplier(id: string) {
  await getSupplier(id);
  // Soft: set status inactive
  return prisma.supplier.update({
    where: { id },
    data: { status: "INACTIVE" },
  });
}
