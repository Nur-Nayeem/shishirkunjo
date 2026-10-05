import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as bannerService from "./banner.service.js";

const publicRouter = Router();
publicRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await bannerService.listPublicBanners();
    return sendSuccess(res, { items });
  })
);

const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

const createSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  imageUrl: z.string().url(),
  mobileImageUrl: z.string().url().optional(),
  buttonText: z.string().max(50).optional(),
  buttonUrl: z.string().optional(),
  sortOrder: z.number().int().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

adminRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await bannerService.listAdminBanners();
    return sendSuccess(res, { items });
  })
);

adminRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createSchema.parse(req.body);
    const banner = await bannerService.createBanner(input);
    return sendSuccess(res, { banner }, "Banner created", 201);
  })
);

adminRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = createSchema.partial().parse(req.body);
    const banner = await bannerService.updateBanner(req.params.id, input);
    return sendSuccess(res, { banner }, "Banner updated");
  })
);

adminRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await bannerService.deleteBanner(req.params.id);
    return sendSuccess(res, null, "Banner deleted");
  })
);

export { publicRouter as bannerPublicRoutes, adminRouter as bannerAdminRoutes };
