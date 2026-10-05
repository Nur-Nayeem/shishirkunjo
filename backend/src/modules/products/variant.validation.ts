import { z } from "zod";

export const createVariantSchema = z.object({
  name: z.string().min(1).max(100),
  sku: z.string().min(1).max(50),
  price: z.number().min(0).optional().nullable(),
  purchasePrice: z.number().min(0).optional().nullable(),
  stockQuantity: z.number().int().min(0).optional().default(0),
  weight: z.number().min(0).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateVariantSchema = createVariantSchema.partial();

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
