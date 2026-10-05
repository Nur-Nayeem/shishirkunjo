# Gap Fixes — Phase 0–4 Completion

**Status:** ✅ Done

---

## 1. Seed File (`prisma/seed.ts`)

```bash
npx prisma db seed
# or
npm run prisma:seed
```

**Creates:**
| Item | Details |
|------|---------|
| Admin | `01700000000` / `admin123` |
| Customer | `01711111111` / `customer123` |
| Categories | Home Decor (+ sub), Nakshi, Handmade (+ Bamboo), Gifts |
| Collections | New Arrivals, Best Sellers, Under ৳500, Premium |
| Products | 6 sample products with images + collections |
| Settings | Delivery charges, free threshold, store info |
| Coupon | `SHISHIR10` — 10% off, min ৳1000, max ৳200 |
| Supplier | Bengal Crafts Ltd |

---

## 2. Forgot Password

```
POST /api/v1/auth/forgot-password
{ "phone": "01711111111" }

POST /api/v1/auth/reset-password
{ "phone": "01711111111", "otp": "123456", "newPassword": "newpass123" }
```

- MVP: OTP logged to console in development (`devOtp` in response)
- Production: replace with SMS gateway
- OTP expires in 10 minutes
- Phone enumeration protected (always returns success message)

---

## 3. Variant Admin CRUD

```
GET    /api/v1/admin/products/:productId/variants
POST   /api/v1/admin/products/:productId/variants
PATCH  /api/v1/admin/products/:productId/variants/:variantId
DELETE /api/v1/admin/products/:productId/variants/:variantId  → soft deactivate
```

Body (create):
```json
{
  "name": "Large",
  "sku": "SK-HM-0001-L",
  "price": 850,
  "purchasePrice": 400,
  "stockQuantity": 10
}
```

---

## 4. Login → Guest Cart Merge

```
POST /api/v1/auth/login
{
  "phone": "01711111111",
  "password": "customer123",
  "sessionId": "guest-abc123"
}
```

Or header: `x-session-id: guest-abc123`

Guest cart items are merged into the user cart on successful login.

---

## How to apply on your machine

```bash
cd backend
npm install
cp .env.example .env
# Edit DATABASE_URL and PORT=5000

npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Then test:
```bash
# Login as admin
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"01700000000","password":"admin123"}'

# List products
curl http://localhost:5000/api/v1/products
```
