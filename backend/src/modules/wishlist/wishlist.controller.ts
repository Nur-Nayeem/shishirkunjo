import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as wishlistService from "./wishlist.service.js";

const addSchema = z.object({
  productId: z.string().uuid(),
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await wishlistService.getWishlist(req.user!.id);
  return sendSuccess(res, { wishlist });
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = addSchema.parse(req.body);
  const wishlist = await wishlistService.addItem(req.user!.id, productId);
  return sendSuccess(res, { wishlist }, "Added to wishlist");
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await wishlistService.removeItem(
    req.user!.id,
    req.params.productId
  );
  return sendSuccess(res, { wishlist }, "Removed from wishlist");
});
