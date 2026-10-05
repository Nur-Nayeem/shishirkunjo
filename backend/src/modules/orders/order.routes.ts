import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  requireAuth,
  optionalAuth,
} from "../../middleware/auth.middleware.js";
import {
  createOrderSchema,
  validateCheckoutSchema,
} from "./order.validation.js";
import * as ctrl from "./order.controller.js";

const router = Router();

// Checkout can be guest or logged-in
router.post(
  "/checkout/validate",
  optionalAuth,
  validate(validateCheckoutSchema),
  ctrl.validateCheckout
);

router.post(
  "/",
  optionalAuth,
  validate(createOrderSchema),
  ctrl.createOrder
);

// Customer order history — requires auth
router.get("/", requireAuth, ctrl.listOrders);
router.get("/:id", requireAuth, ctrl.getOrder);
router.get("/:id/tracking", requireAuth, ctrl.getTracking);

export default router;
