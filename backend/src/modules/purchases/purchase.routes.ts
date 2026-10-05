import { Router } from "express";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import * as ctrl from "./purchase.controller.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);

export default router;
