# Phase 4 — Cart, Wishlist, Address, Checkout & Orders

**Status:** ✅ Complete

---

## Endpoints

### Cart (Guest + Logged-in)
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/v1/cart` | Optional | Header `x-session-id` for guest |
| POST | `/api/v1/cart/items` | Optional | `{ productId, variantId?, quantity }` |
| PATCH | `/api/v1/cart/items/:id` | Optional | `{ quantity }` |
| DELETE | `/api/v1/cart/items/:id` | Optional | Remove item |
| DELETE | `/api/v1/cart` | Optional | Clear cart |

### Wishlist (Logged-in only)
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/v1/wishlist` | Required |
| POST | `/api/v1/wishlist/items` | Required | `{ productId }` |
| DELETE | `/api/v1/wishlist/items/:productId` | Required |

### Addresses (Logged-in only)
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/v1/addresses` | Required |
| GET | `/api/v1/addresses/:id` | Required |
| POST | `/api/v1/addresses` | Required |
| PATCH | `/api/v1/addresses/:id` | Required |
| DELETE | `/api/v1/addresses/:id` | Required |
| PATCH | `/api/v1/addresses/:id/default` | Required |

### Delivery
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/v1/delivery/calculate` | Public | `{ district, area? }` |
| GET | `/api/v1/delivery/settings` | Public |

### Coupons
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/v1/coupons/validate` | Public | `{ code, cartTotal }` |

### Orders / Checkout
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/v1/orders/checkout/validate` | Optional | Pre-check prices, stock, coupon, delivery |
| POST | `/api/v1/orders` | Optional | Place COD order |
| GET | `/api/v1/orders` | Required | My orders |
| GET | `/api/v1/orders/:id` | Required | Order details |
| GET | `/api/v1/orders/:id/tracking` | Required | Timeline |

---

## Order Create Flow (Critical)

```
REQUEST
  → Validate products (active + stock)
  → Resolve current prices (backend calculates — never trust frontend)
  → Resolve address (addressId or inline)
  → Calculate delivery charge (from Settings)
  → Validate coupon
  → Check minimum order
  → Apply free delivery threshold
  → Generate order number: SK-YYYYMMDD-0001
  → Transaction:
      - Create Order + OrderItems (price snapshot + purchasePrice)
      - Create OrderAddress (snapshot)
      - Create Payment (COD, PENDING)
      - Create Delivery (PENDING)
      - Coupon usage + increment
      - Clear user cart
  → Return order
```

**Stock is NOT deducted on place order.**  
Stock is reserved/deducted only when Admin **Confirms** the order (Phase 5).

---

## Guest Checkout

- Cart uses `x-session-id` header
- Order can be placed without login using inline `address`
- `customerName` + `customerPhone` required via address

---

## Business Rules Applied

1. Frontend total is never trusted
2. Prices snapshotted on order items
3. purchasePrice snapshotted (for profit reports)
4. Address snapshotted
5. COD only (MVP)
6. Stock check at place time, deduct at confirm time
7. Order number: `SK-20261005-0001`

---

## Next Phase

**Phase 5: Admin Order Management + Inventory Flow**
- Confirm order → stock deduct
- Cancel → stock return
- Processing → Delivery assign → Delivered
- Payment = PAID on delivered
- Purchase module → Stock IN
