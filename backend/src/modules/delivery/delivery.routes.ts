import { Router } from "express";
import * as ctrl from "./delivery.controller.js";

const router = Router();

router.post("/calculate", ctrl.calculate);
router.get("/settings", ctrl.settings);

export default router;
