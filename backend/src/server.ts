import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { config } from "./config/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import {
  categoryPublicRoutes,
  categoryAdminRoutes,
} from "./modules/categories/category.routes.js";
import {
  collectionPublicRoutes,
  collectionAdminRoutes,
} from "./modules/collections/collection.routes.js";
import {
  productPublicRoutes,
  productAdminRoutes,
} from "./modules/products/product.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import wishlistRoutes from "./modules/wishlist/wishlist.routes.js";
import addressRoutes from "./modules/addresses/address.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import deliveryRoutes from "./modules/delivery/delivery.routes.js";
import couponRoutes from "./modules/coupons/coupon.routes.js";
import adminOrderRoutes from "./modules/admin-orders/admin-order.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import supplierRoutes from "./modules/suppliers/supplier.routes.js";
import purchaseRoutes from "./modules/purchases/purchase.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";
import {
  reviewPublicRoutes,
  reviewAdminRoutes,
} from "./modules/reviews/review.routes.js";
import adminCouponRoutes from "./modules/admin-coupons/admin-coupon.routes.js";
import {
  bannerPublicRoutes,
  bannerAdminRoutes,
} from "./modules/banners/banner.routes.js";
import {
  settingsPublicRoutes,
  settingsAdminRoutes,
} from "./modules/settings/settings.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";

dotenv.config();

const app = express();
const api = config.apiPrefix;

app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Shishir Kunjo API is running",
    timestamp: new Date().toISOString(),
  });
});

app.get(api, (_req, res) => {
  res.json({
    success: true,
    message: "Shishir Kunjo API v1",
    brand: "শিশির কুঞ্জ",
  });
});

// ── Public / Customer ──────────────────────
app.use(`${api}/auth`, authRoutes);
app.use(`${api}/categories`, categoryPublicRoutes);
app.use(`${api}/collections`, collectionPublicRoutes);
app.use(`${api}/products`, productPublicRoutes);
app.use(`${api}/cart`, cartRoutes);
app.use(`${api}/wishlist`, wishlistRoutes);
app.use(`${api}/addresses`, addressRoutes);
app.use(`${api}/orders`, orderRoutes);
app.use(`${api}/delivery`, deliveryRoutes);
app.use(`${api}/coupons`, couponRoutes);
app.use(`${api}/banners`, bannerPublicRoutes);
app.use(`${api}/settings`, settingsPublicRoutes);
app.use(`${api}`, reviewPublicRoutes); // /products/:id/reviews

// ── Admin ──────────────────────────────────
app.use(`${api}/admin/categories`, categoryAdminRoutes);
app.use(`${api}/admin/collections`, collectionAdminRoutes);
app.use(`${api}/admin/products`, productAdminRoutes);
app.use(`${api}/admin/orders`, adminOrderRoutes);
app.use(`${api}/admin/inventory`, inventoryRoutes);
app.use(`${api}/admin/suppliers`, supplierRoutes);
app.use(`${api}/admin/purchases`, purchaseRoutes);
app.use(`${api}/admin/dashboard`, dashboardRoutes);
app.use(`${api}/admin/customers`, customerRoutes);
app.use(`${api}/admin/reviews`, reviewAdminRoutes);
app.use(`${api}/admin/coupons`, adminCouponRoutes);
app.use(`${api}/admin/banners`, bannerAdminRoutes);
app.use(`${api}/admin/settings`, settingsAdminRoutes);
app.use(`${api}/admin/reports`, reportsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    error: { code: "NOT_FOUND" },
  });
});

app.use(errorMiddleware);

app.listen(config.port, () => {
  console.log(`🌿 Shishir Kunjo API running on http://localhost:${config.port}`);
  console.log(`   Health : http://localhost:${config.port}/health`);
  console.log(`   API    : http://localhost:${config.port}${api}`);
});
