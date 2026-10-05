import { prisma } from "../../lib/prisma.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.validation.js";

export async function listCategories(opts?: { activeOnly?: boolean }) {
  const where = opts?.activeOnly ? { isActive: true } : {};

  const categories = await prisma.category.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      children: {
        where: opts?.activeOnly ? { isActive: true } : undefined,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
      _count: { select: { products: true } },
    },
  });

  // Return only root categories (parentId = null) with nested children
  return categories.filter((c) => !c.parentId);
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
      parent: true,
      _count: { select: { products: true } },
    },
  });

  if (!category || !category.isActive) {
    throw new NotFoundError("Category not found");
  }

  return category;
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
      parent: true,
      _count: { select: { products: true } },
    },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
}

export async function createCategory(input: CreateCategoryInput) {
  const existing = await prisma.category.findUnique({
    where: { slug: input.slug },
  });
  if (existing) {
    throw new ConflictError("Category slug already exists", "SLUG_EXISTS");
  }

  if (input.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: input.parentId },
    });
    if (!parent) {
      throw new NotFoundError("Parent category not found");
    }
  }

  return prisma.category.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      image: input.image || null,
      parentId: input.parentId || null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  await getCategoryById(id);

  if (input.slug) {
    const existing = await prisma.category.findFirst({
      where: { slug: input.slug, NOT: { id } },
    });
    if (existing) {
      throw new ConflictError("Category slug already exists", "SLUG_EXISTS");
    }
  }

  if (input.parentId) {
    if (input.parentId === id) {
      throw new ConflictError("Category cannot be its own parent");
    }
    const parent = await prisma.category.findUnique({
      where: { id: input.parentId },
    });
    if (!parent) {
      throw new NotFoundError("Parent category not found");
    }
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.image !== undefined && { image: input.image || null }),
      ...(input.parentId !== undefined && { parentId: input.parentId }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
}

export async function deleteCategory(id: string) {
  const category = await getCategoryById(id);

  // Soft approach: deactivate instead of hard delete if has products
  if (category._count.products > 0) {
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Also deactivate children
  await prisma.category.updateMany({
    where: { parentId: id },
    data: { isActive: false },
  });

  return prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
}
