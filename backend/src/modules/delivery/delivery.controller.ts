import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as deliveryService from "./delivery.service.js";

const calculateSchema = z.object({
  district: z.string().min(2),
  area: z.string().optional(),
});

export const calculate = asyncHandler(async (req: Request, res: Response) => {
  const { district, area } = calculateSchema.parse(req.body);
  const result = await deliveryService.calculateDeliveryCharge(district, area);
  return sendSuccess(res, result);
});

export const settings = asyncHandler(async (_req: Request, res: Response) => {
  const result = await deliveryService.getDeliverySettings();
  return sendSuccess(res, result);
});
