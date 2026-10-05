import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import {
  orderListQuerySchema,
  assignOwnDeliverySchema,
  shipCourierSchema,
  cancelOrderSchema,
  failedDeliverySchema,
} from "./admin-order.validation.js";
import * as ctrl from "./admin-order.controller.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", validate(orderListQuerySchema, "query"), ctrl.list);
router.get("/:id", ctrl.getById);

router.patch("/:id/confirm", ctrl.confirm);
router.patch("/:id/cancel", validate(cancelOrderSchema), ctrl.cancel);
router.patch("/:id/processing", ctrl.processing);

router.post(
  "/:id/delivery/assign",
  validate(assignOwnDeliverySchema),
  ctrl.assignOwnDelivery
);
router.post(
  "/:id/delivery/ship",
  validate(shipCourierSchema),
  ctrl.shipCourier
);

router.patch("/:id/out-for-delivery", ctrl.outForDelivery);
router.patch("/:id/delivered", ctrl.delivered);
router.patch(
  "/:id/failed-delivery",
  validate(failedDeliverySchema),
  ctrl.failedDelivery
);
router.patch("/:id/return", ctrl.returned);

export default router;
