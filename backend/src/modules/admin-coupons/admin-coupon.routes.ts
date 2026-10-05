import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as couponService from "./admin-coupon.service.js";

const router = Router();
router.use(requireAuth, requireAdmin);

const createSchema = z.object({
  code: z.string().min(2).max(30),
  type: z.enum(["FIXED", "PERCENTAGE"]),
  value: z.number().min(0),
  minimumOrderAmount: z.number().min(0).optional(),
  maximumDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await couponService.listCoupons();
    return sendSuccess(res, { items });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const coupon = await couponService.getCoupon(req.params.id);
    return sendSuccess(res, { coupon });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createSchema.parse(req.body);
    const coupon = await couponService.createCoupon(input);
    return sendSuccess(res, { coupon }, "Coupon created", 201);
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = createSchema.partial().parse(req.body);
    const coupon = await couponService.updateCoupon(req.params.id, input);
    return sendSuccess(res, { coupon }, "Coupon updated");
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const coupon = await couponService.deleteCoupon(req.params.id);
    return sendSuccess(res, { coupon }, "Coupon deactivated");
  })
);

export default router;
