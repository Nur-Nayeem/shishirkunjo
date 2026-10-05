import { z } from "zod";

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "OUT_FOR_DELIVERY",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
      "FAILED_DELIVERY",
    ])
    .optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  deliveryMethod: z.enum(["OWN", "COURIER"]).optional(),
  search: z.string().optional(), // orderNumber, customerName, phone
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const assignOwnDeliverySchema = z.object({
  deliveryPersonName: z.string().min(2).max(100),
  deliveryPersonPhone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Invalid BD phone"),
  notes: z.string().max(500).optional(),
});

export const shipCourierSchema = z.object({
  courierName: z.string().min(2).max(100),
  trackingNumber: z.string().min(1).max(100),
  notes: z.string().max(500).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const failedDeliverySchema = z.object({
  reason: z.string().min(2).max(500),
});

export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
