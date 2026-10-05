import { Router } from "express";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import * as ctrl from "./inventory.controller.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", ctrl.list);
router.get("/summary", ctrl.summary);
router.get("/:productId/history", ctrl.history);
router.post("/adjust", ctrl.adjust);

export default router;
