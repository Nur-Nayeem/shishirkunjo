# শিশির কুঞ্জ — Frontend

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
npm run dev
```

Open http://localhost:3000

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/shop` | Product listing + filters |
| `/product/[slug]` | Product details |
| `/cart` | Cart |
| `/checkout` | COD checkout |
| `/order/[orderNumber]` | Order success / tracking |
| `/auth/login` | Login (email) |
| `/auth/register` | Register |
| `/account/*` | Profile, orders, addresses, wishlist |
| `/about`, `/contact`, `/faq` | Static |
| `/policies/*` | Shipping, returns, privacy, terms |

## Design System

**Earthy Heritage & Organic Minimalist**

- Background: `#FAF8F5`
- Foreground: `#1C2E24`
- Primary: `#C45A3F` (Terracotta)
- Secondary: `#E2ECE9` (Sage)
- Accent: `#DFBA6B` (Gold)
- Radius: craft-sm 4px / craft-md 12px / craft-lg 24px
- Fonts: Playfair Display (headings) + Inter / Noto Sans Bengali
