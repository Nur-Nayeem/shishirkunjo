import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { optionalAuth } from "../../middleware/auth.middleware.js";
import { addCartItemSchema, updateCartItemSchema } from "./cart.validation.js";
import * as ctrl from "./cart.controller.js";

const router = Router();

// Guest + logged-in both supported via optionalAuth + x-session-id header
router.use(optionalAuth);

router.get("/", ctrl.getCart);
router.post("/items", validate(addCartItemSchema), ctrl.addItem);
router.patch("/items/:id", validate(updateCartItemSchema), ctrl.updateItem);
router.delete("/items/:id", ctrl.removeItem);
router.delete("/", ctrl.clearCart);

export default router;
