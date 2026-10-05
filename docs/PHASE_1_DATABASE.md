# Phase 1 — Database Schema (Prisma)

**Status:** ✅ Complete

**File:** `backend/prisma/schema.prisma` (686 lines)

---

## Enums

| Enum | Values |
|------|--------|
| Role | CUSTOMER, ADMIN |
| UserStatus | ACTIVE, BLOCKED |
| ProductStatus | ACTIVE, DRAFT, ARCHIVED |
| OrderStatus | PENDING → CONFIRMED → PROCESSING → OUT_FOR_DELIVERY → SHIPPED → DELIVERED / CANCELLED / RETURNED / FAILED_DELIVERY |
| PaymentMethod | COD (+ future ready) |
| PaymentStatus | PENDING, PAID, FAILED, REFUNDED |
| DeliveryMethod | OWN, COURIER |
| DeliveryStatus | PENDING, ASSIGNED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, FAILED, RETURNED |
| InventoryTransactionType | PURCHASE, SALE, RETURN, CANCEL, DAMAGE, ADJUSTMENT |
| PurchaseStatus | PENDING, COMPLETED, CANCELLED |
| ReviewStatus | PENDING, APPROVED, REJECTED |
| CouponType | FIXED, PERCENTAGE |
| SettingType | STRING, NUMBER, BOOLEAN, JSON |

---

## Tables (26)

### Auth
- `users`
- `addresses`

### Catalog
- `categories` (self-referencing tree)
- `collections`
- `products`
- `product_images`
- `product_variants`
- `product_collections` (M2M)

### Supply
- `suppliers`
- `purchases`
- `purchase_items`
- `inventory_transactions`

### Shopping
- `carts` (guest via sessionId + logged-in via userId)
- `cart_items`
- `wishlists`
- `wishlist_items`

### Sales
- `orders` (historical snapshot of customer info)
- `order_items` (price + purchasePrice snapshot)
- `order_addresses` (address snapshot)
- `payments`
- `deliveries`

### Engagement
- `reviews` (unique per user+product+order)
- `coupons`
- `coupon_usages`

### CMS & System
- `banners`
- `settings`
- `audit_logs`

---

## Critical Business Rules Encoded

1. **Stock reserve on Confirm** — handled in service layer (schema supports inventory_transactions)
2. **Order is historical snapshot** — customerName, phone, productName, unitPrice, purchasePrice stored on order/order_item
3. **Address snapshot** — order_addresses independent of user addresses
4. **Soft delete for products** — status = ARCHIVED (never hard delete)
5. **Review only after delivered** — enforced in service + unique constraint
6. **Guest cart** — sessionId on carts
7. **Profit tracking** — purchasePrice on order_items enables profit reports

---

## Indexes

All critical lookup fields indexed:
- products.slug, products.sku, products.status, products.categoryId
- orders.orderNumber, orders.userId, orders.orderStatus, orders.createdAt
- users.phone, users.email
- coupons.code
- inventory_transactions.productId + type + createdAt

---

## Next: How to apply

```bash
cd backend
npm install
cp .env.example .env
# Set DATABASE_URL to your PostgreSQL

npx prisma generate
npx prisma migrate dev --name init
```

---

## Phase 1 Checklist

- [x] All enums
- [x] All core tables from Database Architecture v1.0
- [x] Relations (1:N, N:M, self-ref)
- [x] Unique constraints
- [x] Indexes for performance
- [x] Soft delete via status
- [x] Snapshot fields for orders
- [x] Inventory transaction history
- [x] Future-ready payment methods

**Ready for Phase 2: Backend Core + Authentication**
