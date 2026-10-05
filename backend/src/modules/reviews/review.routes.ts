import { Router } from "express";
import { z } from "zod";
import {
  requireAuth,
  requireAdmin,
} from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as reviewService from "./review.service.js";

// Public + customer
const publicRouter = Router();

publicRouter.get(
  "/products/:productId/reviews",
  asyncHandler(async (req, res) => {
    const items = await reviewService.listPublicReviews(req.params.productId);
    return sendSuccess(res, { items });
  })
);

publicRouter.post(
  "/products/:productId/reviews",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        orderId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(1000).optional(),
      })
      .parse(req.body);

    const review = await reviewService.createReview(
      req.user!.id,
      req.params.productId,
      body
    );
    return sendSuccess(res, { review }, "Review submitted", 201);
  })
);

// Admin
const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await reviewService.listAdminReviews({
      status: req.query.status as "PENDING" | "APPROVED" | "REJECTED" | undefined,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    return sendSuccess(res, result);
  })
);

adminRouter.patch(
  "/:id/approve",
  asyncHandler(async (req, res) => {
    const review = await reviewService.moderateReview(req.params.id, "APPROVED");
    return sendSuccess(res, { review }, "Review approved");
  })
);

adminRouter.patch(
  "/:id/reject",
  asyncHandler(async (req, res) => {
    const review = await reviewService.moderateReview(req.params.id, "REJECTED");
    return sendSuccess(res, { review }, "Review rejected");
  })
);

adminRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await reviewService.deleteReview(req.params.id);
    return sendSuccess(res, null, "Review deleted");
  })
);

export { publicRouter as reviewPublicRoutes, adminRouter as reviewAdminRoutes };
