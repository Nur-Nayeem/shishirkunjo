import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createAddressSchema,
  updateAddressSchema,
} from "./address.validation.js";
import * as ctrl from "./address.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", validate(createAddressSchema), ctrl.create);
router.patch("/:id", validate(updateAddressSchema), ctrl.update);
router.delete("/:id", ctrl.remove);
router.patch("/:id/default", ctrl.setDefault);

export default router;
