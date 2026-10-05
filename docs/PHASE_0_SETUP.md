# Phase 0 — Project Foundation & Setup

**Status:** ✅ Complete (Scaffold Ready)

---

## What was created

### Root
```
shishir-kunjo/
├── README.md
├── backend/
├── frontend/
└── docs/
```

### Backend (`backend/`)
- `package.json` — Express + TypeScript + Prisma + Zod + security packages
- `tsconfig.json` — strict TypeScript (NodeNext)
- `.env.example` — all required environment variables
- `.gitignore`
- `src/server.ts` — basic Express server with Helmet, CORS, Rate Limit
- `src/config/index.ts` — centralized config
- `src/utils/response.ts` — standard API response helpers
- Folder structure: `middleware/`, `modules/`, `utils/`, `types/`, `prisma/`

### Frontend (`frontend/`)
- `package.json` — Next.js 15 + React 19 + Tailwind v4 + shadcn-ready
- `tsconfig.json`
- `postcss.config.mjs` — Tailwind v4 PostCSS plugin
- `next.config.ts`
- `.env.example`
- `.gitignore`
- `src/app/globals.css` — **Full Design System** (Warm Natural palette)
- `src/app/layout.tsx` — Root layout + Bengali font
- `src/app/page.tsx` — Temporary homepage placeholder
- `src/lib/utils.ts` — `cn()` helper

---

## Design System Tokens (Tailwind v4)

| Token | Value | Usage |
|-------|-------|-------|
| `brand-*` | Warm brown/beige | Primary brand |
| `accent-*` | Earthy green | Secondary accent |
| `terra-*` | Terracotta | Subtle warm accent |
| `ivory / cream / sand` | Backgrounds | Warm whites |
| `charcoal` | `#2c2a26` | Text |
| `warm-gray` | Muted text | Secondary text |
| Radius | 6–12px | Soft, not bubble |

**Style direction:** Warm + Minimal + Natural + Premium  
Avoid: blue corporate, excessive gold, heavy shadows, neon.

---

## How to run (on your machine)

### 1. Backend
```bash
cd shishir-kunjo/backend
npm install
cp .env.example .env
# Edit DATABASE_URL
npx prisma init   # (we will do full schema in Phase 1)
npm run dev
```

### 2. Frontend
```bash
cd shishir-kunjo/frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend → http://localhost:3000  
Backend  → http://localhost:4000

---

## Next Step

**Phase 1: Exact Prisma Schema**

We will write the complete `schema.prisma` based on the Database Architecture document (all tables, relations, enums, indexes).

---

*Generated: Phase 0 — October 2026*
