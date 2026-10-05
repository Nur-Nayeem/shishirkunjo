import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as orderService from "./order.service.js";
import type { CreateOrderInput } from "./order.validation.js";

export const validateCheckout = asyncHandler(
  async (req: Request, res: Response) => {
    const input = req.body as CreateOrderInput;
    const result = await orderService.validateCheckout(input, req.user?.id);
    return sendSuccess(res, result);
  }
);

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateOrderInput;
  const result = await orderService.createOrder(input, req.user?.id);
  return sendSuccess(res, result, "Order placed successfully", 201);
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const status = req.query.status as string | undefined;
  const result = await orderService.getCustomerOrders(req.user!.id, {
    page,
    limit,
    status,
  });
  return sendSuccess(res, result);
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getCustomerOrder(
    req.user!.id,
    req.params.id
  );
  return sendSuccess(res, { order });
});

export const getTracking = asyncHandler(async (req: Request, res: Response) => {
  const tracking = await orderService.getOrderTracking(
    req.user!.id,
    req.params.id
  );
  return sendSuccess(res, tracking);
});
