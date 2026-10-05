import { prisma } from "../../lib/prisma.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "./collection.validation.js";

export async function listCollections(opts?: { activeOnly?: boolean }) {
  const where = opts?.activeOnly ? { isActive: true } : {};

  return prisma.collection.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function getCollectionBySlug(slug: string) {
  const collection = await prisma.collection.findUnique({
    where: { slug },
    include: {
      _count: { select: { products: true } },
    },
  });

  if (!collection || !collection.isActive) {
    throw new NotFoundError("Collection not found");
  }

  return collection;
}

export async function getCollectionById(id: string) {
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              regularPrice: true,
              salePrice: true,
              status: true,
            },
          },
        },
      },
      _count: { select: { products: true } },
    },
  });

  if (!collection) {
    throw new NotFoundError("Collection not found");
  }

  return collection;
}

export async function createCollection(input: CreateCollectionInput) {
  const existing = await prisma.collection.findUnique({
    where: { slug: input.slug },
  });
  if (existing) {
    throw new ConflictError("Collection slug already exists", "SLUG_EXISTS");
  }

  return prisma.collection.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      image: input.image || null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
    },
  });
}

export async function updateCollection(id: string, input: UpdateCollectionInput) {
  await getCollectionById(id);

  if (input.slug) {
    const existing = await prisma.collection.findFirst({
      where: { slug: input.slug, NOT: { id } },
    });
    if (existing) {
      throw new ConflictError("Collection slug already exists", "SLUG_EXISTS");
    }
  }

  return prisma.collection.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.image !== undefined && { image: input.image || null }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.startDate !== undefined && {
        startDate: input.startDate ? new Date(input.startDate) : null,
      }),
      ...(input.endDate !== undefined && {
        endDate: input.endDate ? new Date(input.endDate) : null,
      }),
    },
  });
}

export async function deleteCollection(id: string) {
  await getCollectionById(id);
  return prisma.collection.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function assignProducts(collectionId: string, productIds: string[]) {
  await getCollectionById(collectionId);

  // Verify products exist
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true },
  });
  if (products.length !== productIds.length) {
    throw new NotFoundError("One or more products not found");
  }

  // Upsert join records
  await prisma.$transaction(
    productIds.map((productId) =>
      prisma.productCollection.upsert({
        where: {
          productId_collectionId: { productId, collectionId },
        },
        create: { productId, collectionId },
        update: {},
      })
    )
  );

  return getCollectionById(collectionId);
}

export async function removeProduct(collectionId: string, productId: string) {
  await getCollectionById(collectionId);

  await prisma.productCollection.deleteMany({
    where: { collectionId, productId },
  });

  return getCollectionById(collectionId);
}
