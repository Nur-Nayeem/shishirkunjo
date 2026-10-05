# Phase 6 — Dashboard, Reports, Marketing, Settings

**Status:** ✅ Complete

---

## Dashboard
```
GET /api/v1/admin/dashboard
```
Returns: today/month sales, pending orders, customers, products, low/out stock, estimated profit, 7-day chart, recent orders, top products.

---

## Customers
```
GET    /api/v1/admin/customers?search=&page=
GET    /api/v1/admin/customers/:id
PATCH  /api/v1/admin/customers/:id/status  { "status": "ACTIVE"|"BLOCKED" }
```

---

## Reviews
```
# Public
GET  /api/v1/products/:productId/reviews
POST /api/v1/products/:productId/reviews  (auth, delivered order only)

# Admin
GET    /api/v1/admin/reviews?status=PENDING
PATCH  /api/v1/admin/reviews/:id/approve
PATCH  /api/v1/admin/reviews/:id/reject
DELETE /api/v1/admin/reviews/:id
```

---

## Coupons (Admin CRUD)
```
GET/POST           /api/v1/admin/coupons
GET/PATCH/DELETE   /api/v1/admin/coupons/:id
```

---

## Banners
```
GET            /api/v1/banners          (public active)
GET/POST       /api/v1/admin/banners
PATCH/DELETE   /api/v1/admin/banners/:id
```

---

## Settings
```
GET    /api/v1/settings              (public: store + delivery charges)
GET    /api/v1/admin/settings        (all)
PATCH  /api/v1/admin/settings        { "dhaka_delivery_charge": 90, ... }
```

---

## Reports
```
GET /api/v1/admin/reports/sales?dateFrom=&dateTo=
GET /api/v1/admin/reports/orders
GET /api/v1/admin/reports/products
GET /api/v1/admin/reports/inventory
GET /api/v1/admin/reports/purchases
GET /api/v1/admin/reports/customers
GET /api/v1/admin/reports/profit
```

**Profit report** (delivered orders only):
- revenue, productCost, discounts, deliveryCollected, estimatedProfit

---

## Full Admin API Surface (Phases 2–6)

| Area | Base path |
|------|-----------|
| Auth | `/api/v1/auth` |
| Dashboard | `/api/v1/admin/dashboard` |
| Orders | `/api/v1/admin/orders` |
| Products | `/api/v1/admin/products` |
| Categories | `/api/v1/admin/categories` |
| Collections | `/api/v1/admin/collections` |
| Inventory | `/api/v1/admin/inventory` |
| Suppliers | `/api/v1/admin/suppliers` |
| Purchases | `/api/v1/admin/purchases` |
| Customers | `/api/v1/admin/customers` |
| Reviews | `/api/v1/admin/reviews` |
| Coupons | `/api/v1/admin/coupons` |
| Banners | `/api/v1/admin/banners` |
| Settings | `/api/v1/admin/settings` |
| Reports | `/api/v1/admin/reports/*` |

---

## Next Phase

**Phase 7: Customer Frontend + Polish + Deployment**
- Design system pages
- Homepage, Shop, Product, Cart, Checkout
- Account pages
- Admin panel UI (or keep API-first for now)
