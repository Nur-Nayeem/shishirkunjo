import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as ctrl from "./wishlist.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", ctrl.getWishlist);
router.post("/items", ctrl.addItem);
router.delete("/items/:productId", ctrl.removeItem);

export default router;
