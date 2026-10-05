import { Router } from "express";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as settingsService from "./settings.service.js";

const publicRouter = Router();
publicRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const settings = await settingsService.getPublicSettings();
    return sendSuccess(res, { settings });
  })
);

const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await settingsService.getAllSettings();
    return sendSuccess(res, { items });
  })
);

adminRouter.patch(
  "/",
  asyncHandler(async (req, res) => {
    const items = await settingsService.updateSettings(req.body);
    return sendSuccess(res, { items }, "Settings updated");
  })
);

export {
  publicRouter as settingsPublicRoutes,
  adminRouter as settingsAdminRoutes,
};
