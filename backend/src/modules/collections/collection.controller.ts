import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as collectionService from "./collection.service.js";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "./collection.validation.js";

export const listPublic = asyncHandler(async (_req: Request, res: Response) => {
  const items = await collectionService.listCollections({ activeOnly: true });
  return sendSuccess(res, { items });
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const collection = await collectionService.getCollectionBySlug(req.params.slug);
  return sendSuccess(res, { collection });
});

export const listAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const items = await collectionService.listCollections();
  return sendSuccess(res, { items });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const collection = await collectionService.getCollectionById(req.params.id);
  return sendSuccess(res, { collection });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateCollectionInput;
  const collection = await collectionService.createCollection(input);
  return sendSuccess(res, { collection }, "Collection created", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateCollectionInput;
  const collection = await collectionService.updateCollection(req.params.id, input);
  return sendSuccess(res, { collection }, "Collection updated");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const collection = await collectionService.deleteCollection(req.params.id);
  return sendSuccess(res, { collection }, "Collection deactivated");
});

export const assignProducts = asyncHandler(async (req: Request, res: Response) => {
  const { productIds } = req.body as { productIds: string[] };
  const collection = await collectionService.assignProducts(
    req.params.id,
    productIds
  );
  return sendSuccess(res, { collection }, "Products assigned");
});

export const removeProduct = asyncHandler(async (req: Request, res: Response) => {
  const collection = await collectionService.removeProduct(
    req.params.id,
    req.params.productId
  );
  return sendSuccess(res, { collection }, "Product removed from collection");
});
