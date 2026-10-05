import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as inventoryService from "./inventory.service.js";

const adjustSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int(),
  reason: z.string().max(300).optional(),
});

export const summary = asyncHandler(async (_req: Request, res: Response) => {
  const data = await inventoryService.getInventorySummary();
  return sendSuccess(res, data);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.listInventory({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    filter: (req.query.filter as "all" | "low" | "out") || "all",
    search: req.query.search as string | undefined,
  });
  return sendSuccess(res, result);
});

export const history = asyncHandler(async (req: Request, res: Response) => {
  const result = await inventoryService.getProductHistory(req.params.productId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
  });
  return sendSuccess(res, result);
});

export const adjust = asyncHandler(async (req: Request, res: Response) => {
  const input = adjustSchema.parse(req.body);
  const product = await inventoryService.adjustStock(input);
  return sendSuccess(res, { product }, "Stock adjusted");
});
