import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as variantService from "./variant.service.js";
import type {
  CreateVariantInput,
  UpdateVariantInput,
} from "./variant.validation.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const items = await variantService.listVariants(req.params.productId);
  return sendSuccess(res, { items });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateVariantInput;
  const variant = await variantService.createVariant(
    req.params.productId,
    input
  );
  return sendSuccess(res, { variant }, "Variant created", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateVariantInput;
  const variant = await variantService.updateVariant(
    req.params.productId,
    req.params.variantId,
    input
  );
  return sendSuccess(res, { variant }, "Variant updated");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const variant = await variantService.deleteVariant(
    req.params.productId,
    req.params.variantId
  );
  return sendSuccess(res, { variant }, "Variant deactivated");
});
