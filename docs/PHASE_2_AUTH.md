# Phase 2 — Backend Core + Authentication

**Status:** ✅ Complete

---

## What was built

### Core Infrastructure
| File | Purpose |
|------|---------|
| `src/lib/prisma.ts` | Prisma client singleton (prevents hot-reload connection leaks) |
| `src/utils/errors.ts` | AppError hierarchy (Unauthorized, Forbidden, NotFound, Conflict, Validation) |
| `src/utils/asyncHandler.ts` | Wraps async route handlers → errors go to error middleware |
| `src/utils/response.ts` | Standard `{ success, message, data }` / `{ success, message, error }` |
| `src/middleware/error.middleware.ts` | Zod + AppError + Prisma error handling |
| `src/middleware/validate.middleware.ts` | Zod schema validation for body/query/params |
| `src/middleware/auth.middleware.ts` | `requireAuth`, `requireAdmin`, `optionalAuth` |
| `src/types/express.d.ts` | Extends Express Request with `user` |

### Auth Module
| File | Purpose |
|------|---------|
| `auth.validation.ts` | Zod schemas (register, login) — BD phone validation |
| `auth.service.ts` | Business logic (hash, JWT, sanitize) |
| `auth.controller.ts` | Thin HTTP layer |
| `auth.routes.ts` | Route definitions |

---

## API Endpoints

### POST `/api/v1/auth/register`
```json
{
  "name": "Nayeem",
  "phone": "017XXXXXXXX",
  "email": "optional@email.com",
  "password": "secret123"
}
```
**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id", "name", "phone", "email", "role", "status", "createdAt" },
    "accessToken": "jwt..."
  }
}
```

### POST `/api/v1/auth/login`
```json
{
  "phone": "017XXXXXXXX",
  "password": "secret123"
}
```
**Response 200:** same shape as register

### GET `/api/v1/auth/me`
**Header:** `Authorization: Bearer <token>`
**Response 200:** `{ success, data: { user } }`

### POST `/api/v1/auth/logout`
**Header:** `Authorization: Bearer <token>`
**Response 200:** client should discard token (stateless JWT)

---

## Security Rules Applied

- Password hashed with bcrypt (12 rounds)
- JWT signed with secret from env
- Phone unique (BD format: `01[3-9]XXXXXXXX`)
- Email unique when provided
- Blocked users cannot login
- Password never returned in response
- Rate limiting on all routes
- Helmet + CORS configured

---

## How to test (after `npm install` + migrate)

```bash
# Register
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"01712345678","password":"secret123"}'

# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"01712345678","password":"secret123"}'

# Me
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## Next Phase

**Phase 3: Catalog Module**
- Categories (tree)
- Collections
- Products CRUD (Admin)
- Public product list + filters + details by slug
