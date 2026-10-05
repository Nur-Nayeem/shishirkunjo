import { z } from "zod";

export const createProductSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  sku: z.string().min(1).max(50),
  shortDescription: z.string().max(500).optional(),
  description: z.string().min(1),
  purchasePrice: z.number().min(0),
  regularPrice: z.number().min(0),
  salePrice: z.number().min(0).optional().nullable(),
  stockQuantity: z.number().int().min(0).optional().default(0),
  lowStockThreshold: z.number().int().min(0).optional().default(5),
  weight: z.number().min(0).optional().nullable(),
  material: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
  size: z.string().max(50).optional(),
  isHandmade: z.boolean().optional().default(false),
  isPremium: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional().default("DRAFT"),
  seoTitle: z.string().max(120).optional(),
  metaDescription: z.string().max(300).optional(),
  collectionIds: z.array(z.string().uuid()).optional(),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        altText: z.string().optional(),
        sortOrder: z.number().int().min(0).optional().default(0),
        isPrimary: z.boolean().optional().default(false),
      })
    )
    .optional(),
});

export const updateProductSchema = createProductSchema.partial().omit({
  images: true,
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  category: z.string().optional(), // slug
  collection: z.string().optional(), // slug
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z
    .enum(["newest", "oldest", "price_asc", "price_desc", "name"])
    .optional()
    .default("newest"),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional(),
  inStock: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export const stockAdjustSchema = z.object({
  quantity: z.number().int(),
  note: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
