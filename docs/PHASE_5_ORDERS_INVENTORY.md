# Phase 5 — Admin Orders + Inventory + Purchases

**Status:** ✅ Complete

---

## Order Lifecycle

```
PENDING ──confirm──► CONFIRMED ──processing──► PROCESSING
                         │                         │
                         ├── own delivery ─────────┤
                         └── courier ship ─────────┤
                                                   ▼
                                          OUT_FOR_DELIVERY / SHIPPED
                                                   │
                                    ┌──────────────┼──────────────┐
                                    ▼              ▼              ▼
                               DELIVERED    FAILED_DELIVERY    (return stock)
                                    │
                                    ▼
                               RETURNED (stock back, payment REFUNDED)
```

**Stock rules:**
| Action | Stock |
|--------|-------|
| Place order | No change |
| Confirm | Deduct + SALE transaction |
| Cancel (after confirm) | Return + CANCEL transaction |
| Failed delivery | Return + RETURN transaction |
| Return (after delivered) | Return + RETURN transaction |
| Delivered | Payment → PAID |

---

## Admin Order Endpoints

All require `Authorization: Bearer <admin-token>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/orders` | List + filters |
| GET | `/api/v1/admin/orders/:id` | Details + estimated profit |
| PATCH | `/api/v1/admin/orders/:id/confirm` | Confirm + stock deduct |
| PATCH | `/api/v1/admin/orders/:id/cancel` | Cancel + stock return |
| PATCH | `/api/v1/admin/orders/:id/processing` | Mark processing |
| POST | `/api/v1/admin/orders/:id/delivery/assign` | Own delivery |
| POST | `/api/v1/admin/orders/:id/delivery/ship` | Courier |
| PATCH | `/api/v1/admin/orders/:id/out-for-delivery` | Out for delivery |
| PATCH | `/api/v1/admin/orders/:id/delivered` | Delivered + PAID |
| PATCH | `/api/v1/admin/orders/:id/failed-delivery` | Failed + stock return |
| PATCH | `/api/v1/admin/orders/:id/return` | Return + stock restore |

### Filters
```
?status=PENDING&paymentStatus=PENDING&search=SK-2026&page=1&limit=20
&dateFrom=2026-10-01T00:00:00Z&dateTo=2026-10-31T23:59:59Z
```

---

## Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/inventory` | List (`?filter=low\|out`) |
| GET | `/api/v1/admin/inventory/summary` | KPIs |
| GET | `/api/v1/admin/inventory/:productId/history` | Transaction history |
| POST | `/api/v1/admin/inventory/adjust` | Manual adjust |

```json
POST /admin/inventory/adjust
{ "productId": "...", "quantity": -2, "reason": "Damaged" }
```

---

## Suppliers

| Method | Endpoint |
|--------|----------|
| GET/POST | `/api/v1/admin/suppliers` |
| GET/PATCH/DELETE | `/api/v1/admin/suppliers/:id` |

---

## Purchases (Stock IN)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/purchases` | List |
| GET | `/api/v1/admin/purchases/:id` | Details |
| POST | `/api/v1/admin/purchases` | Create + auto stock IN |

```json
POST /admin/purchases
{
  "supplierId": "...",
  "invoiceNumber": "INV-001",
  "purchaseDate": "2026-10-05",
  "additionalCost": 100,
  "items": [
    { "productId": "...", "quantity": 20, "unitCost": 350 }
  ]
}
```

---

## Profit on Order Details

Admin order details includes:
- `productCost` — sum of purchasePrice × qty
- `estimatedProfit` — totalAmount − productCost − deliveryCharge − discount

---

## Next Phase

**Phase 6: Admin Dashboard + Reports + Marketing**
- Dashboard KPIs
- Sales / Orders / Products / Inventory / Profit reports
- Coupons CRUD (admin)
- Banners CRUD
- Settings
