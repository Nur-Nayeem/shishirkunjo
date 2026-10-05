import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as productService from "./product.service.js";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQuery,
} from "./product.validation.js";

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ProductQuery;
  const result = await productService.listProducts(query, false);
  return sendSuccess(res, result);
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductBySlug(req.params.slug);
  return sendSuccess(res, { product });
});

export const featured = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 8;
  const items = await productService.getFeatured(limit);
  return sendSuccess(res, { items });
});

export const newArrivals = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 8;
  const items = await productService.getNewArrivals(limit);
  return sendSuccess(res, { items });
});

export const bestSellers = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 8;
  const items = await productService.getBestSellers(limit);
  return sendSuccess(res, { items });
});

// Admin
export const listAdmin = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ProductQuery;
  const result = await productService.listProducts(query, true);
  return sendSuccess(res, result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  return sendSuccess(res, { product });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateProductInput;
  const product = await productService.createProduct(input);
  return sendSuccess(res, { product }, "Product created", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateProductInput;
  const product = await productService.updateProduct(req.params.id, input);
  return sendSuccess(res, { product }, "Product updated");
});

export const archive = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.archiveProduct(req.params.id);
  return sendSuccess(res, { product }, "Product archived");
});

export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const { quantity, note } = req.body as { quantity: number; note?: string };
  const product = await productService.adjustStock(
    req.params.id,
    quantity,
    note
  );
  return sendSuccess(res, { product }, "Stock adjusted");
});
