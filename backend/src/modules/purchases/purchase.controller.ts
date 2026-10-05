import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as purchaseService from "./purchase.service.js";

const createSchema = z.object({
  supplierId: z.string().uuid(),
  invoiceNumber: z.string().optional(),
  purchaseDate: z.string(), // ISO date
  additionalCost: z.number().min(0).optional().default(0),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional().nullable(),
        quantity: z.number().int().min(1),
        unitCost: z.number().min(0),
      })
    )
    .min(1),
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await purchaseService.listPurchases({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    supplierId: req.query.supplierId as string | undefined,
  });
  return sendSuccess(res, result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const purchase = await purchaseService.getPurchase(req.params.id);
  return sendSuccess(res, { purchase });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createSchema.parse(req.body);
  const purchase = await purchaseService.createPurchase(input);
  return sendSuccess(
    res,
    { purchase },
    "Purchase created — stock updated",
    201
  );
});
