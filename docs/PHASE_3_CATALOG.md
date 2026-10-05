# Phase 3 — Catalog Module

**Status:** ✅ Complete

---

## Modules

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/categories` | Public | Tree of active categories |
| GET | `/api/v1/categories/:slug` | Public | Category by slug |
| GET | `/api/v1/admin/categories` | Admin | All categories (incl. inactive) |
| GET | `/api/v1/admin/categories/id/:id` | Admin | By ID |
| POST | `/api/v1/admin/categories` | Admin | Create |
| PATCH | `/api/v1/admin/categories/:id` | Admin | Update |
| DELETE | `/api/v1/admin/categories/:id` | Admin | Soft deactivate |

### Collections
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/collections` | Public | Active collections |
| GET | `/api/v1/collections/:slug` | Public | By slug |
| GET | `/api/v1/admin/collections` | Admin | All |
| GET | `/api/v1/admin/collections/id/:id` | Admin | By ID + products |
| POST | `/api/v1/admin/collections` | Admin | Create |
| PATCH | `/api/v1/admin/collections/:id` | Admin | Update |
| DELETE | `/api/v1/admin/collections/:id` | Admin | Soft deactivate |
| POST | `/api/v1/admin/collections/:id/products` | Admin | Assign products |
| DELETE | `/api/v1/admin/collections/:id/products/:productId` | Admin | Remove product |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/products` | Public | List + filters + pagination |
| GET | `/api/v1/products/featured` | Public | Featured products |
| GET | `/api/v1/products/new-arrivals` | Public | Newest |
| GET | `/api/v1/products/best-sellers` | Public | By order quantity |
| GET | `/api/v1/products/:slug` | Public | Details (no purchasePrice) |
| GET | `/api/v1/admin/products` | Admin | List (incl. purchasePrice) |
| GET | `/api/v1/admin/products/id/:id` | Admin | Full details |
| POST | `/api/v1/admin/products` | Admin | Create + images + collections |
| PATCH | `/api/v1/admin/products/:id` | Admin | Update |
| DELETE | `/api/v1/admin/products/:id` | Admin | Archive |
| PATCH | `/api/v1/admin/products/:id/stock` | Admin | Manual stock adjust + inventory tx |

---

## Product List Query Params

```
?page=1
&limit=20
&search=basket
&category=home-decor
&collection=new-arrivals
&minPrice=200
&maxPrice=2000
&sort=newest|oldest|price_asc|price_desc|name
&featured=true
&inStock=true
&status=ACTIVE   (admin only)
```

---

## Security Rules

- Public product responses **never** include `purchasePrice`
- Only `ACTIVE` products visible publicly
- Soft delete: `status = ARCHIVED` (never hard delete)
- Stock adjust creates `inventory_transactions` record
- Admin routes protected by `requireAuth + requireAdmin`

---

## Files Created

```
modules/categories/
  category.validation.ts
  category.service.ts
  category.controller.ts
  category.routes.ts

modules/collections/
  collection.validation.ts
  collection.service.ts
  collection.controller.ts
  collection.routes.ts

modules/products/
  product.validation.ts
  product.service.ts
  product.controller.ts
  product.routes.ts
```

---

## Next Phase

**Phase 4: Cart, Wishlist, Address & Checkout**
