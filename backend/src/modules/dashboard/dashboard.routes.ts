import { Router } from "express";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import { getDashboard } from "./dashboard.service.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await getDashboard();
    return sendSuccess(res, data);
  })
);

export default router;
