import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as customerService from "./customer.service.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await customerService.listCustomers({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      search: req.query.search as string | undefined,
    });
    return sendSuccess(res, result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const customer = await customerService.getCustomer(req.params.id);
    return sendSuccess(res, { customer });
  })
);

router.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { status } = z
      .object({ status: z.enum(["ACTIVE", "BLOCKED"]) })
      .parse(req.body);
    const customer = await customerService.updateCustomerStatus(
      req.params.id,
      status
    );
    return sendSuccess(res, { customer }, "Customer status updated");
  })
);

export default router;
