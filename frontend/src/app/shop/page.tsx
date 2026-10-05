import { productsApi, categoriesApi } from "@/lib/api";
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "@/lib/demo-data";
import Link from "next/link";
import Image from "next/image";
import type { Product, Category } from "@/types";
import { ShopRefine } from "./shop-refine";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SearchParams {
  page?: string;
  search?: string;
  category?: string;
  featured?: string;
  inStock?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
}

const PER_PAGE = 6;

export const metadata = {
  title: "সব পণ্য | শিশির কুঞ্জ",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || 1));

  let all: Product[] = [];
  let categories: Category[] = DEMO_CATEGORIES;

  try {
    const [prodRes, catRes] = await Promise.all([
      productsApi.list({
        page: 1,
        limit: 100,
        search: sp.search,
        category: sp.category,
        featured: sp.featured === "true" ? true : undefined,
        inStock: sp.inStock === "true" ? true : undefined,
        sort: sp.sort || "newest",
        minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
        maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      }),
      categoriesApi.list(),
    ]);
    all = Array.isArray(prodRes.data) ? prodRes.data : [];
    if (Array.isArray(catRes.data) && catRes.data.length) categories = catRes.data;
    if (!all.length) all = filterDemo(sp);
  } catch {
    all = filterDemo(sp);
  }

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const products = all.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const activeCat = categories.find((c) => c.slug === sp.category);

  const qs = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...sp, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    const s = params.toString();
    return `/shop${s ? `?${s}` : ""}`;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ── Compact split hero ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="relative min-h-[240px] sm:min-h-[320px] lg:min-h-[380px]">
            <Image
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85"
              alt="শিশির কুঞ্জ কালেকশন"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
            <p
              className="mb-2 text-[11px] font-semibold tracking-[0.28em] uppercase"
              style={{ color: "var(--primary)" }}
            >
              {activeCat ? activeCat.name : "Collection"}
            </p>
            <h1
              className="font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.75rem]"
              style={{ color: "var(--foreground)" }}
            >
              {sp.search
                ? `"${sp.search}"`
                : activeCat
                  ? activeCat.name
                  : "সব পণ্য"}
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              প্রকৃতি ও কারিগরের হাতের ছোঁয়ায় নির্বাচিত হোম ডেকর —{" "}
              <strong style={{ color: "var(--foreground)" }}>{total}</strong> টি পণ্য
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${c.slug}`}
                  className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium transition-craft hover:border-primary hover:text-primary"
                  style={{
                    background:
                      sp.category === c.slug ? "var(--primary)" : "transparent",
                    color:
                      sp.category === c.slug
                        ? "var(--primary-foreground)"
                        : "var(--foreground)",
                    borderColor:
                      sp.category === c.slug ? "var(--primary)" : undefined,
                  }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Centered category strip ── */}
      <nav className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl justify-center gap-1 overflow-x-auto px-3 py-0 sm:gap-2 sm:px-6">
          <CatTab href="/shop" label="সব" active={!sp.category} />
          {categories.map((c) => (
            <CatTab
              key={c.id}
              href={qs({ category: c.slug, page: undefined })}
              label={c.name}
              active={sp.category === c.slug}
            />
          ))}
        </div>
      </nav>

      {/* Toolbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          দেখাচ্ছে{" "}
          <span style={{ color: "var(--foreground)", fontWeight: 600 }}>
            {(safePage - 1) * PER_PAGE + (products.length ? 1 : 0)}
            –{(safePage - 1) * PER_PAGE + products.length}
          </span>{" "}
          / {total}
        </p>
        <ShopRefine
          currentSort={sp.sort || "newest"}
          currentMaxPrice={sp.maxPrice}
          currentFeatured={sp.featured === "true"}
          currentInStock={sp.inStock === "true"}
          category={sp.category}
        />
      </div>

      {/* ── Cards ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <div className="rounded-craft-lg border border-dashed border-border py-24 text-center">
            <p className="font-display text-xl font-semibold">কোনো পণ্য নেই</p>
            <Link
              href="/shop"
              className="mt-4 inline-block text-sm font-medium"
              style={{ color: "var(--primary)" }}
            >
              সব দেখুন →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {products.map((product, i) => (
              <ShopCard key={product.id} product={product} priority={i < 3} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <nav
            className="mt-14 flex flex-wrap items-center justify-center gap-2"
            aria-label="Pagination"
          >
            {safePage > 1 ? (
              <Link
                href={qs({ page: String(safePage - 1) })}
                className="inline-flex h-10 items-center gap-1 rounded-full border border-border bg-card px-4 text-sm font-medium transition-craft hover:bg-secondary"
              >
                <ChevronLeft className="h-4 w-4" />
                আগে
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center gap-1 rounded-full border border-border px-4 text-sm opacity-40">
                <ChevronLeft className="h-4 w-4" />
                আগে
              </span>
            )}

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={qs({ page: String(n) })}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-craft"
                  style={{
                    background:
                      n === safePage ? "var(--primary)" : "transparent",
                    color:
                      n === safePage
                        ? "var(--primary-foreground)"
                        : "var(--foreground)",
                  }}
                  aria-current={n === safePage ? "page" : undefined}
                >
                  {n}
                </Link>
              ))}
            </div>

            {safePage < totalPages ? (
              <Link
                href={qs({ page: String(safePage + 1) })}
                className="inline-flex h-10 items-center gap-1 rounded-full border border-border bg-card px-4 text-sm font-medium transition-craft hover:bg-secondary"
              >
                পরে
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center gap-1 rounded-full border border-border px-4 text-sm opacity-40">
                পরে
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

function CatTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative shrink-0 px-3.5 py-3.5 text-sm font-medium transition-craft sm:px-4"
      style={{ color: active ? "var(--primary)" : "var(--muted)" }}
    >
      {label}
      {active && (
        <span
          className="absolute inset-x-2 bottom-0 h-[2px] rounded-full"
          style={{ background: "var(--primary)" }}
        />
      )}
    </Link>
  );
}

function ShopCard({
  product,
  priority,
}: {
  product: Product;
  priority?: boolean;
}) {
  const regular = Number(product.regularPrice);
  const sale = product.salePrice != null ? Number(product.salePrice) : null;
  const hasSale = sale !== null && sale < regular;
  const price = hasSale ? sale! : regular;
  const img = product.images?.[0]?.url;
  const discount =
    hasSale && regular > 0
      ? Math.round(((regular - sale!) / regular) * 100)
      : 0;

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-craft-md transition-craft"
      style={{
        background: "var(--card)",
        boxShadow: "var(--shadow-organic)",
      }}
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden"
        style={{ background: "var(--secondary)" }}
      >
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-xs"
            style={{ color: "var(--muted)" }}
          >
            No image
          </div>
        )}

        {/* badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {hasSale && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{
                background: "var(--accent)",
                color: "var(--accent-foreground)",
              }}
            >
              −{discount}%
            </span>
          )}
          {product.isPremium && !hasSale && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: "var(--sand)",
                color: "var(--bark)",
              }}
            >
              Premium
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 px-3.5 py-3.5 sm:px-4 sm:py-4">
        {product.category && (
          <p
            className="text-[10px] font-medium tracking-wider uppercase"
            style={{ color: "var(--muted)" }}
          >
            {product.category.name}
          </p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3
            className="font-display text-[0.95rem] font-semibold leading-snug transition-craft group-hover:text-primary sm:text-base"
            style={{ color: "var(--foreground)" }}
          >
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-sm font-bold sm:text-base"
              style={{ color: "var(--primary)" }}
            >
              {formatPrice(price)}
            </span>
            {hasSale && (
              <span
                className="text-xs line-through"
                style={{ color: "var(--muted)" }}
              >
                {formatPrice(regular)}
              </span>
            )}
          </div>
          {product.isHandmade && (
            <span className="badge-material hidden sm:inline">হাতে তৈরি</span>
          )}
        </div>
      </div>
    </article>
  );
}

function filterDemo(sp: SearchParams): Product[] {
  let list = [...DEMO_PRODUCTS];
  if (sp.category) list = list.filter((p) => p.category?.slug === sp.category);
  if (sp.featured === "true") list = list.filter((p) => p.isFeatured);
  if (sp.inStock === "true")
    list = list.filter((p) => (p.stockQuantity ?? 0) > 0);
  if (sp.maxPrice) {
    const max = Number(sp.maxPrice);
    list = list.filter((p) => Number(p.salePrice ?? p.regularPrice) <= max);
  }
  if (sp.minPrice) {
    const min = Number(sp.minPrice);
    list = list.filter((p) => Number(p.salePrice ?? p.regularPrice) >= min);
  }
  if (sp.search) {
    const q = sp.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q)
    );
  }
  if (sp.sort === "price_asc")
    list.sort(
      (a, b) =>
        Number(a.salePrice ?? a.regularPrice) -
        Number(b.salePrice ?? b.regularPrice)
    );
  else if (sp.sort === "price_desc")
    list.sort(
      (a, b) =>
        Number(b.salePrice ?? b.regularPrice) -
        Number(a.salePrice ?? a.regularPrice)
    );
  return list;
}
