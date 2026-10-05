"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

type Props = {
  currentSort: string;
  currentMaxPrice?: string;
  currentFeatured: boolean;
  currentInStock: boolean;
  category?: string;
};

export function ShopRefine({
  currentSort,
  currentMaxPrice,
  currentFeatured,
  currentInStock,
  category,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState(currentSort);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice || "");
  const [featured, setFeatured] = useState(currentFeatured);
  const [inStock, setInStock] = useState(currentInStock);

  const activeCount =
    (currentMaxPrice ? 1 : 0) +
    (currentFeatured ? 1 : 0) +
    (currentInStock ? 1 : 0) +
    (currentSort !== "newest" ? 1 : 0);

  const apply = () => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (sort && sort !== "newest") q.set("sort", sort);
    if (maxPrice) q.set("maxPrice", maxPrice);
    if (featured) q.set("featured", "true");
    if (inStock) q.set("inStock", "true");
    const qs = q.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    setOpen(false);
  };

  const clear = () => {
    setSort("newest");
    setMaxPrice("");
    setFeatured(false);
    setInStock(false);
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    const qs = q.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium transition-craft hover:bg-secondary"
        style={{ color: "var(--foreground)" }}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Refine
        {activeCount > 0 && (
          <span
            className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0"
            style={{
              background:
                "color-mix(in srgb, var(--foreground) 45%, transparent)",
            }}
            onClick={() => setOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-md rounded-t-craft-lg border border-border bg-card p-6 shadow-lift sm:rounded-craft-lg"
            style={{ maxHeight: "85vh", overflowY: "auto" }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Refine</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 hover:bg-secondary"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <fieldset className="mb-5">
              <legend
                className="mb-2 text-[11px] font-semibold tracking-wider uppercase"
                style={{ color: "var(--muted)" }}
              >
                সাজান
              </legend>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "newest", l: "নতুন আগে" },
                  { v: "price_asc", l: "দাম কম → বেশি" },
                  { v: "price_desc", l: "দাম বেশি → কম" },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setSort(o.v)}
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-craft"
                    style={{
                      background:
                        sort === o.v ? "var(--primary)" : "var(--secondary)",
                      color:
                        sort === o.v
                          ? "var(--primary-foreground)"
                          : "var(--secondary-foreground)",
                    }}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mb-5">
              <legend
                className="mb-2 text-[11px] font-semibold tracking-wider uppercase"
                style={{ color: "var(--muted)" }}
              >
                বাজেট
              </legend>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: "", l: "যেকোনো" },
                  { v: "500", l: "৳500 পর্যন্ত" },
                  { v: "1000", l: "৳1,000 পর্যন্ত" },
                ].map((o) => (
                  <button
                    key={o.l}
                    type="button"
                    onClick={() => setMaxPrice(o.v)}
                    className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-craft"
                    style={{
                      background:
                        maxPrice === o.v
                          ? "var(--primary)"
                          : "var(--secondary)",
                      color:
                        maxPrice === o.v
                          ? "var(--primary-foreground)"
                          : "var(--secondary-foreground)",
                    }}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mb-8 space-y-2">
              <legend
                className="mb-2 text-[11px] font-semibold tracking-wider uppercase"
                style={{ color: "var(--muted)" }}
              >
                আরও
              </legend>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded accent-[var(--primary)]"
                />
                শুধু ফিচার্ড
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="h-4 w-4 rounded accent-[var(--primary)]"
                />
                স্টকে আছে
              </label>
            </fieldset>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={clear}
                className="flex-1 rounded-craft-md border border-border py-2.5 text-sm font-medium transition-craft hover:bg-secondary"
              >
                রিসেট
              </button>
              <button
                type="button"
                onClick={apply}
                className="flex-1 rounded-craft-md py-2.5 text-sm font-medium text-primary-foreground transition-craft"
                style={{ background: "var(--primary)" }}
              >
                দেখুন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
