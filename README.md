# 🌿 শিশির কুঞ্জ (Shishir Kunjo)

**Home Decor + Nakshi + Handmade + Gift Ecommerce**  
Bangladesh | Own Inventory | COD First

---

## Project Structure

```
shishir-kunjo/
├── backend/          # Express + TypeScript + Prisma API
├── frontend/         # Next.js 15 (Customer Website + Admin Panel)
├── docs/             # Specifications & Architecture
└── README.md
```

## Tech Stack

### Backend
- Node.js 20+
- Express + TypeScript
- Prisma ORM + PostgreSQL
- Zod (validation)
- JWT + bcrypt
- Helmet, CORS, Rate Limiting

### Frontend
- Next.js 15/16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Custom Design System (Warm + Natural + Premium)

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL
- pnpm or npm

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Development Roadmap

- ✅ Phase 0: Project Foundation & Setup
- ⏳ Phase 1: Database Schema (Prisma)
- ⏳ Phase 2: Backend Core + Auth
- ⏳ Phase 3: Catalog Module
- ⏳ Phase 4: Cart, Wishlist, Checkout
- ⏳ Phase 5: Order + Inventory Flow
- ⏳ Phase 6: Admin Panel + Reports
- ⏳ Phase 7: Customer Frontend + Deployment

---

**Brand Feeling:** সৌন্দর্য • ঐতিহ্য • ঘর • ভালোবাসা  
**Tagline:** ঘর সাজুক সৌন্দর্য আর ঐতিহ্যের ছোঁয়ায়।
