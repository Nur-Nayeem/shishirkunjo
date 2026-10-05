import { Router } from "express";
import * as ctrl from "./coupon.controller.js";

const router = Router();

router.post("/validate", ctrl.validate);

export default router;
