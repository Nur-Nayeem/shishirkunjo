import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as couponService from "./coupon.service.js";

const validateSchema = z.object({
  code: z.string().min(1),
  cartTotal: z.number().min(0),
});

export const validate = asyncHandler(async (req: Request, res: Response) => {
  const { code, cartTotal } = validateSchema.parse(req.body);
  const result = await couponService.validateCoupon(code, cartTotal);
  return sendSuccess(res, result);
});
