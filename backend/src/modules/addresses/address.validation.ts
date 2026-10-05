import { z } from "zod";

export const createAddressSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),
  district: z.string().min(2).max(50),
  area: z.string().min(2).max(100),
  addressLine: z.string().min(5).max(300),
  postalCode: z.string().max(20).optional(),
  deliveryNote: z.string().max(300).optional(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
