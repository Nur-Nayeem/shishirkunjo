import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as supplierService from "./supplier.service.js";

const createSchema = z.object({
  name: z.string().min(2).max(150),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial().extend({
  status: z.string().optional(),
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const items = await supplierService.listSuppliers();
  return sendSuccess(res, { items });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.getSupplier(req.params.id);
  return sendSuccess(res, { supplier });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createSchema.parse(req.body);
  const supplier = await supplierService.createSupplier(input);
  return sendSuccess(res, { supplier }, "Supplier created", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = updateSchema.parse(req.body);
  const supplier = await supplierService.updateSupplier(req.params.id, input);
  return sendSuccess(res, { supplier }, "Supplier updated");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.deleteSupplier(req.params.id);
  return sendSuccess(res, { supplier }, "Supplier deactivated");
});
