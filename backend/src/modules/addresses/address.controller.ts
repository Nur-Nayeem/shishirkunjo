import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as addressService from "./address.service.js";
import type { CreateAddressInput, UpdateAddressInput } from "./address.validation.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const items = await addressService.listAddresses(req.user!.id);
  return sendSuccess(res, { items });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const address = await addressService.getAddress(req.user!.id, req.params.id);
  return sendSuccess(res, { address });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateAddressInput;
  const address = await addressService.createAddress(req.user!.id, input);
  return sendSuccess(res, { address }, "Address created", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateAddressInput;
  const address = await addressService.updateAddress(
    req.user!.id,
    req.params.id,
    input
  );
  return sendSuccess(res, { address }, "Address updated");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await addressService.deleteAddress(req.user!.id, req.params.id);
  return sendSuccess(res, null, "Address deleted");
});

export const setDefault = asyncHandler(async (req: Request, res: Response) => {
  const address = await addressService.setDefault(req.user!.id, req.params.id);
  return sendSuccess(res, { address }, "Default address updated");
});
