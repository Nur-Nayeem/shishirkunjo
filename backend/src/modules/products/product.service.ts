import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQuery,
} from "./product.validation.js";

const publicSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  shortDescription: true,
  regularPrice: true,
  salePrice: true,
  stockQuantity: true,
  material: true,
  color: true,
  size: true,
  isHandmade: true,
  isPremium: true,
  isFeatured: true,
  status: true,
  createdAt: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
  images: {
    orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
    take: 1,
  },
};

function effectivePrice(regularPrice: Prisma.Decimal, salePrice: Prisma.Decimal | null) {
  if (salePrice !== null && salePrice < regularPrice) {
    return salePrice;
  }
  return regularPrice;
}

export async function listProducts(query: ProductQuery, isAdmin = false) {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    collection,
    minPrice,
    maxPrice,
    sort = "newest",
    featured,
    status,
    inStock,
  } = query;

  const where: Prisma.ProductWhereInput = {};

  // Public only sees ACTIVE
  if (!isAdmin) {
    where.status = ProductStatus.ACTIVE;
  } else if (status) {
    where.status = status as ProductStatus;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (collection) {
    where.collections = {
      some: { collection: { slug: collection } },
    };
  }

  if (featured !== undefined) {
    where.isFeatured = featured;
  }

  if (inStock === true) {
    where.stockQuantity = { gt: 0 };
  } else if (inStock === false) {
    where.stockQuantity = { lte: 0 };
  }

  // Price filter on effective selling price is complex in Prisma;
  // filter on regularPrice / salePrice range as approximation
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : []),
      {
        OR: [
          {
            salePrice: {
              not: null,
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          },
          {
            salePrice: null,
            regularPrice: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          },
        ],
      },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "price_asc"
        ? { regularPrice: "asc" }
        : sort === "price_desc"
          ? { regularPrice: "desc" }
          : sort === "name"
            ? { name: "asc" }
            : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: isAdmin
        ? {
            ...publicSelect,
            purchasePrice: true,
            lowStockThreshold: true,
            description: true,
            weight: true,
            seoTitle: true,
            metaDescription: true,
            updatedAt: true,
            images: {
              orderBy: [
                { isPrimary: "desc" as const },
                { sortOrder: "asc" as const },
              ],
            },
          }
        : publicSelect,
    }),
    prisma.product.count({ where }),
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

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
      variants: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
      collections: {
        include: {
          collection: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: { reviews: { where: { status: "APPROVED" } } },
      },
    },
  });

  if (!product || product.status !== ProductStatus.ACTIVE) {
    throw new NotFoundError("Product not found");
  }

  // Hide purchasePrice from public
  const { purchasePrice: _, ...publicProduct } = product;
  return publicProduct;
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      variants: true,
      collections: {
        include: { collection: true },
      },
    },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
}

export async function createProduct(input: CreateProductInput) {
  const [slugExists, skuExists] = await Promise.all([
    prisma.product.findUnique({ where: { slug: input.slug } }),
    prisma.product.findUnique({ where: { sku: input.sku } }),
  ]);

  if (slugExists) {
    throw new ConflictError("Product slug already exists", "SLUG_EXISTS");
  }
  if (skuExists) {
    throw new ConflictError("Product SKU already exists", "SKU_EXISTS");
  }

  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const product = await prisma.product.create({
    data: {
      categoryId: input.categoryId,
      name: input.name,
      slug: input.slug,
      sku: input.sku,
      shortDescription: input.shortDescription,
      description: input.description,
      purchasePrice: input.purchasePrice,
      regularPrice: input.regularPrice,
      salePrice: input.salePrice ?? null,
      stockQuantity: input.stockQuantity ?? 0,
      lowStockThreshold: input.lowStockThreshold ?? 5,
      weight: input.weight ?? null,
      material: input.material,
      color: input.color,
      size: input.size,
      isHandmade: input.isHandmade ?? false,
      isPremium: input.isPremium ?? false,
      isFeatured: input.isFeatured ?? false,
      status: (input.status as ProductStatus) ?? ProductStatus.DRAFT,
      seoTitle: input.seoTitle,
      metaDescription: input.metaDescription,
      images: input.images
        ? {
            create: input.images.map((img, i) => ({
              imageUrl: img.imageUrl,
              altText: img.altText,
              sortOrder: img.sortOrder ?? i,
              isPrimary: img.isPrimary ?? i === 0,
            })),
          }
        : undefined,
      collections: input.collectionIds
        ? {
            create: input.collectionIds.map((collectionId) => ({
              collectionId,
            })),
          }
        : undefined,
    },
    include: {
      images: true,
      category: true,
      collections: { include: { collection: true } },
    },
  });

  // Create initial inventory transaction if stock > 0
  if ((input.stockQuantity ?? 0) > 0) {
    await prisma.inventoryTransaction.create({
      data: {
        productId: product.id,
        type: "ADJUSTMENT",
        quantity: input.stockQuantity!,
        previousStock: 0,
        newStock: input.stockQuantity!,
        note: "Initial stock on product create",
      },
    });
  }

  return product;
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await getProductById(id);

  if (input.slug) {
    const existing = await prisma.product.findFirst({
      where: { slug: input.slug, NOT: { id } },
    });
    if (existing) {
      throw new ConflictError("Product slug already exists", "SLUG_EXISTS");
    }
  }

  if (input.sku) {
    const existing = await prisma.product.findFirst({
      where: { sku: input.sku, NOT: { id } },
    });
    if (existing) {
      throw new ConflictError("Product SKU already exists", "SKU_EXISTS");
    }
  }

  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new NotFoundError("Category not found");
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.sku !== undefined && { sku: input.sku }),
      ...(input.shortDescription !== undefined && {
        shortDescription: input.shortDescription,
      }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.purchasePrice !== undefined && {
        purchasePrice: input.purchasePrice,
      }),
      ...(input.regularPrice !== undefined && {
        regularPrice: input.regularPrice,
      }),
      ...(input.salePrice !== undefined && { salePrice: input.salePrice }),
      ...(input.lowStockThreshold !== undefined && {
        lowStockThreshold: input.lowStockThreshold,
      }),
      ...(input.weight !== undefined && { weight: input.weight }),
      ...(input.material !== undefined && { material: input.material }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.size !== undefined && { size: input.size }),
      ...(input.isHandmade !== undefined && { isHandmade: input.isHandmade }),
      ...(input.isPremium !== undefined && { isPremium: input.isPremium }),
      ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
      ...(input.status !== undefined && {
        status: input.status as ProductStatus,
      }),
      ...(input.seoTitle !== undefined && { seoTitle: input.seoTitle }),
      ...(input.metaDescription !== undefined && {
        metaDescription: input.metaDescription,
      }),
    },
    include: {
      images: true,
      category: true,
      collections: { include: { collection: true } },
    },
  });

  // Sync collections if provided
  if (input.collectionIds) {
    await prisma.productCollection.deleteMany({ where: { productId: id } });
    if (input.collectionIds.length > 0) {
      await prisma.productCollection.createMany({
        data: input.collectionIds.map((collectionId) => ({
          productId: id,
          collectionId,
        })),
      });
    }
  }

  return product;
}

export async function archiveProduct(id: string) {
  await getProductById(id);
  return prisma.product.update({
    where: { id },
    data: { status: ProductStatus.ARCHIVED },
  });
}

export async function adjustStock(
  id: string,
  quantity: number,
  note?: string
) {
  const product = await getProductById(id);
  const previousStock = product.stockQuantity;
  const newStock = previousStock + quantity;

  if (newStock < 0) {
    throw new ConflictError("Insufficient stock", "INSUFFICIENT_STOCK");
  }

  const [updated] = await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: { stockQuantity: newStock },
    }),
    prisma.inventoryTransaction.create({
      data: {
        productId: id,
        type: "ADJUSTMENT",
        quantity,
        previousStock,
        newStock,
        note: note || "Manual stock adjustment",
      },
    }),
  ]);

  return updated;
}

export async function getFeatured(limit = 8) {
  return prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: publicSelect,
  });
}

export async function getNewArrivals(limit = 8) {
  return prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: publicSelect,
  });
}

export async function getBestSellers(limit = 8) {
  // Based on order items quantity sold
  const top = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  if (top.length === 0) {
    // Fallback to featured / newest
    return getNewArrivals(limit);
  }

  const productIds = top.map((t) => t.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      status: ProductStatus.ACTIVE,
    },
    select: publicSelect,
  });

  // Preserve order by sales
  const map = new Map(products.map((p) => [p.id, p]));
  return productIds.map((id) => map.get(id)).filter(Boolean);
}
