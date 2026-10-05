import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ForbiddenError } from "../../utils/errors.js";
import type { CreateAddressInput, UpdateAddressInput } from "./address.validation.js";

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAddress(userId: string, id: string) {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address) throw new NotFoundError("Address not found");
  if (address.userId !== userId) throw new ForbiddenError("Not your address");
  return address;
}

export async function createAddress(userId: string, input: CreateAddressInput) {
  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  // First address becomes default
  const count = await prisma.address.count({ where: { userId } });

  return prisma.address.create({
    data: {
      userId,
      fullName: input.fullName,
      phone: input.phone,
      district: input.district,
      area: input.area,
      addressLine: input.addressLine,
      postalCode: input.postalCode,
      deliveryNote: input.deliveryNote,
      isDefault: input.isDefault || count === 0,
    },
  });
}

export async function updateAddress(
  userId: string,
  id: string,
  input: UpdateAddressInput
) {
  await getAddress(userId, id);

  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({
    where: { id },
    data: {
      ...(input.fullName !== undefined && { fullName: input.fullName }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.district !== undefined && { district: input.district }),
      ...(input.area !== undefined && { area: input.area }),
      ...(input.addressLine !== undefined && { addressLine: input.addressLine }),
      ...(input.postalCode !== undefined && { postalCode: input.postalCode }),
      ...(input.deliveryNote !== undefined && { deliveryNote: input.deliveryNote }),
      ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
    },
  });
}

export async function deleteAddress(userId: string, id: string) {
  const address = await getAddress(userId, id);
  await prisma.address.delete({ where: { id } });

  // If deleted was default, set another as default
  if (address.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  return { deleted: true };
}

export async function setDefault(userId: string, id: string) {
  await getAddress(userId, id);

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id },
      data: { isDefault: true },
    }),
  ]);

  return getAddress(userId, id);
}
