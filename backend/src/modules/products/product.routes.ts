import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  stockAdjustSchema,
} from "./product.validation.js";
import {
  createVariantSchema,
  updateVariantSchema,
} from "./variant.validation.js";
import * as ctrl from "./product.controller.js";
import * as variantCtrl from "./variant.controller.js";

const publicRouter = Router();
const adminRouter = Router();

// Public
publicRouter.get("/", validate(productQuerySchema, "query"), ctrl.listPublic);
publicRouter.get("/featured", ctrl.featured);
publicRouter.get("/new-arrivals", ctrl.newArrivals);
publicRouter.get("/best-sellers", ctrl.bestSellers);
publicRouter.get("/:slug", ctrl.getBySlug);

// Admin
adminRouter.use(requireAuth, requireAdmin);
adminRouter.get("/", validate(productQuerySchema, "query"), ctrl.listAdmin);
adminRouter.get("/id/:id", ctrl.getById);
adminRouter.post("/", validate(createProductSchema), ctrl.create);
adminRouter.patch("/:id", validate(updateProductSchema), ctrl.update);
adminRouter.delete("/:id", ctrl.archive);
adminRouter.patch(
  "/:id/stock",
  validate(stockAdjustSchema),
  ctrl.adjustStock
);

// Variant CRUD
adminRouter.get("/:productId/variants", variantCtrl.list);
adminRouter.post(
  "/:productId/variants",
  validate(createVariantSchema),
  variantCtrl.create
);
adminRouter.patch(
  "/:productId/variants/:variantId",
  validate(updateVariantSchema),
  variantCtrl.update
);
adminRouter.delete(
  "/:productId/variants/:variantId",
  variantCtrl.remove
);

export {
  publicRouter as productPublicRoutes,
  adminRouter as productAdminRoutes,
};
