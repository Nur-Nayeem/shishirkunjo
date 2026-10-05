import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as categoryService from "./category.service.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.validation.js";

export const listPublic = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.listCategories({ activeOnly: true });
  return sendSuccess(res, { items: categories });
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  return sendSuccess(res, { category });
});

export const listAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.listCategories();
  return sendSuccess(res, { items: categories });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(req.params.id);
  return sendSuccess(res, { category });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateCategoryInput;
  const category = await categoryService.createCategory(input);
  return sendSuccess(res, { category }, "Category created", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateCategoryInput;
  const category = await categoryService.updateCategory(req.params.id, input);
  return sendSuccess(res, { category }, "Category updated");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.deleteCategory(req.params.id);
  return sendSuccess(res, { category }, "Category deactivated");
});
