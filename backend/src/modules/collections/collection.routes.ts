import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import {
  createCollectionSchema,
  updateCollectionSchema,
  assignProductsSchema,
} from "./collection.validation.js";
import * as ctrl from "./collection.controller.js";

const publicRouter = Router();
const adminRouter = Router();

// Public
publicRouter.get("/", ctrl.listPublic);
publicRouter.get("/:slug", ctrl.getBySlug);

// Admin
adminRouter.use(requireAuth, requireAdmin);
adminRouter.get("/", ctrl.listAdmin);
adminRouter.get("/id/:id", ctrl.getById);
adminRouter.post("/", validate(createCollectionSchema), ctrl.create);
adminRouter.patch("/:id", validate(updateCollectionSchema), ctrl.update);
adminRouter.delete("/:id", ctrl.remove);
adminRouter.post(
  "/:id/products",
  validate(assignProductsSchema),
  ctrl.assignProducts
);
adminRouter.delete("/:id/products/:productId", ctrl.removeProduct);

export {
  publicRouter as collectionPublicRoutes,
  adminRouter as collectionAdminRoutes,
};
