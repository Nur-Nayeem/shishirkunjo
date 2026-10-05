import { Router } from "express";
import { requireAuth, requireAdmin } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import * as reports from "./reports.service.js";

const router = Router();
router.use(requireAuth, requireAdmin);

function range(req: { query: Record<string, unknown> }) {
  return {
    dateFrom: req.query.dateFrom as string | undefined,
    dateTo: req.query.dateTo as string | undefined,
  };
}

router.get(
  "/sales",
  asyncHandler(async (req, res) => {
    const data = await reports.salesReport(range(req));
    return sendSuccess(res, data);
  })
);

router.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const data = await reports.ordersReport(range(req));
    return sendSuccess(res, data);
  })
);

router.get(
  "/products",
  asyncHandler(async (req, res) => {
    const data = await reports.productsReport(range(req));
    return sendSuccess(res, data);
  })
);

router.get(
  "/inventory",
  asyncHandler(async (_req, res) => {
    const data = await reports.inventoryReport();
    return sendSuccess(res, data);
  })
);

router.get(
  "/purchases",
  asyncHandler(async (req, res) => {
    const data = await reports.purchasesReport(range(req));
    return sendSuccess(res, data);
  })
);

router.get(
  "/customers",
  asyncHandler(async (req, res) => {
    const data = await reports.customersReport(range(req));
    return sendSuccess(res, data);
  })
);

router.get(
  "/profit",
  asyncHandler(async (req, res) => {
    const data = await reports.profitReport(range(req));
    return sendSuccess(res, data);
  })
);

export default router;
