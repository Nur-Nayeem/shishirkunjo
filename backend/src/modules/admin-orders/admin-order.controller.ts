import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as orderService from "./admin-order.service.js";
import type { OrderListQuery } from "./admin-order.validation.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as OrderListQuery;
  const result = await orderService.listOrders(query);
  return sendSuccess(res, result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id);
  return sendSuccess(res, { order });
});

export const confirm = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.confirmOrder(req.params.id);
  return sendSuccess(res, { order }, "Order confirmed — stock deducted");
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body as { reason?: string };
  const order = await orderService.cancelOrder(req.params.id, reason);
  return sendSuccess(res, { order }, "Order cancelled");
});

export const processing = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.markProcessing(req.params.id);
  return sendSuccess(res, { order }, "Order marked as processing");
});

export const assignOwnDelivery = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await orderService.assignOwnDelivery(req.params.id, req.body);
    return sendSuccess(res, { order }, "Own delivery assigned");
  }
);

export const shipCourier = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.shipCourier(req.params.id, req.body);
  return sendSuccess(res, { order }, "Shipped via courier");
});

export const outForDelivery = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await orderService.markOutForDelivery(req.params.id);
    return sendSuccess(res, { order }, "Out for delivery");
  }
);

export const delivered = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.markDelivered(req.params.id);
  return sendSuccess(res, { order }, "Order delivered — payment marked PAID");
});

export const failedDelivery = asyncHandler(
  async (req: Request, res: Response) => {
    const { reason } = req.body as { reason: string };
    const order = await orderService.markFailedDelivery(req.params.id, reason);
    return sendSuccess(res, { order }, "Failed delivery — stock returned");
  }
);

export const returned = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body as { reason?: string };
  const order = await orderService.markReturned(req.params.id, reason);
  return sendSuccess(res, { order }, "Order returned — stock restored");
});
