import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as cartService from "./cart.service.js";
import type { AddCartItemInput, UpdateCartItemInput } from "./cart.validation.js";

function identity(req: Request) {
  return {
    userId: req.user?.id,
    sessionId: (req.headers["x-session-id"] as string) || undefined,
  };
}

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const { userId, sessionId } = identity(req);
  const cart = await cartService.getCart(userId, sessionId);
  return sendSuccess(res, { cart });
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { userId, sessionId } = identity(req);
  const input = req.body as AddCartItemInput;
  const cart = await cartService.addItem(input, userId, sessionId);
  return sendSuccess(res, { cart }, "Item added to cart");
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const { userId, sessionId } = identity(req);
  const { quantity } = req.body as UpdateCartItemInput;
  const cart = await cartService.updateItem(
    req.params.id,
    quantity,
    userId,
    sessionId
  );
  return sendSuccess(res, { cart }, "Cart updated");
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const { userId, sessionId } = identity(req);
  const cart = await cartService.removeItem(req.params.id, userId, sessionId);
  return sendSuccess(res, { cart }, "Item removed");
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const { userId, sessionId } = identity(req);
  const cart = await cartService.clearCart(userId, sessionId);
  return sendSuccess(res, { cart }, "Cart cleared");
});
