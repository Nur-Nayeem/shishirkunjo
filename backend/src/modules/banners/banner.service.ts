import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../utils/errors.js";

export async function listPublicBanners() {
  const now = new Date();
  return prisma.banner.findMany({
    where: {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listAdminBanners() {
  return prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function createBanner(data: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}) {
  return prisma.banner.create({
    data: {
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: data.imageUrl,
      mobileImageUrl: data.mobileImageUrl,
      buttonText: data.buttonText,
      buttonUrl: data.buttonUrl,
      sortOrder: data.sortOrder ?? 0,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateBanner(
  id: string,
  data: Partial<{
    title: string;
    subtitle: string | null;
    imageUrl: string;
    mobileImageUrl: string | null;
    buttonText: string | null;
    buttonUrl: string | null;
    sortOrder: number;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
  }>
) {
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Banner not found");

  return prisma.banner.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.mobileImageUrl !== undefined && {
        mobileImageUrl: data.mobileImageUrl,
      }),
      ...(data.buttonText !== undefined && { buttonText: data.buttonText }),
      ...(data.buttonUrl !== undefined && { buttonUrl: data.buttonUrl }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.startDate !== undefined && {
        startDate: data.startDate ? new Date(data.startDate) : null,
      }),
      ...(data.endDate !== undefined && {
        endDate: data.endDate ? new Date(data.endDate) : null,
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function deleteBanner(id: string) {
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Banner not found");
  await prisma.banner.delete({ where: { id } });
  return { deleted: true };
}
