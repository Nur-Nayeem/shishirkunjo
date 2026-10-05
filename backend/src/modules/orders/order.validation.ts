import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "At least one item required"),
  // Either addressId (logged-in) OR inline address (guest)
  addressId: z.string().uuid().optional(),
  address: z
    .object({
      fullName: z.string().min(2).max(100),
      phone: z
        .string()
        .regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),
      district: z.string().min(2).max(50),
      area: z.string().min(2).max(100),
      addressLine: z.string().min(5).max(300),
      postalCode: z.string().max(20).optional(),
      deliveryNote: z.string().max(300).optional(),
    })
    .optional(),
  couponCode: z.string().optional().nullable(),
  notes: z.string().max(500).optional(),
  customerName: z.string().min(2).max(100).optional(),
  customerPhone: z
    .string()
    .regex(/^01[3-9]\d{8}$/)
    .optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

export const validateCheckoutSchema = createOrderSchema;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
