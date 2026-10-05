import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";
import * as ctrl from "./category.controller.js";

const publicRouter = Router();
const adminRouter = Router();

// Public
publicRouter.get("/", ctrl.listPublic);
publicRouter.get("/:slug", ctrl.getBySlug);

// Admin
adminRouter.use(requireAuth, requireAdmin);
adminRouter.get("/", ctrl.listAdmin);
adminRouter.get("/id/:id", ctrl.getById);
adminRouter.post("/", validate(createCategorySchema), ctrl.create);
adminRouter.patch("/:id", validate(updateCategorySchema), ctrl.update);
adminRouter.delete("/:id", ctrl.remove);

export { publicRouter as categoryPublicRoutes, adminRouter as categoryAdminRoutes };
