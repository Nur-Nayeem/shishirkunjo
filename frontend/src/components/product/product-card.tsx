"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const regular = Number(product.regularPrice);
  const sale = product.salePrice != null ? Number(product.salePrice) : null;
  const hasSale = sale !== null && !Number.isNaN(sale) && sale < regular;
  const price = hasSale ? sale! : regular;
  const discountPct = hasSale
    ? Math.round(((regular - sale!) / regular) * 100)
    : 0;
  const image = product.images?.[0]?.url;
  const outOfStock = (product.stockQuantity ?? 0) <= 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    // Demo products: skip API if id is simple demo id
    if (/^\d+$/.test(product.id)) {
      setAdding(true);
      setTimeout(() => setAdding(false), 400);
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, 1);
    } catch {
      /* ignore */
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="card-lift group flex flex-col overflow-hidden rounded-craft-md border border-border bg-card">
      <Link href={`/product/${product.slug}`} className="relative block">
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover transition-craft duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No image
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {hasSale && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground shadow-sm">
                {discountPct}% ছাড়
              </span>
            )}
            {product.isPremium && !hasSale && (
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm" style={{ background: "var(--sand)", color: "var(--bark)" }}>
                Premium
              </span>
            )}
          </div>

          {product.isHandmade && (
            <div className="absolute bottom-2.5 left-2.5">
              <Badge className="backdrop-blur-sm">হাতে তৈরি</Badge>
            </div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-foreground)]/45">
              <span className="rounded-craft-sm bg-card px-3 py-1 text-xs font-semibold">
                স্টক নেই
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
        {product.category && (
          <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
            {product.category.name}
          </p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display line-clamp-2 text-[15px] font-semibold leading-snug text-foreground transition-craft group-hover:text-primary sm:text-base">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center gap-2 pt-1">
          <span className="text-base font-semibold text-primary">
            {formatPrice(price)}
          </span>
          {hasSale && (
            <span className="text-sm text-muted line-through">
              {formatPrice(regular)}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="mt-1 w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
          loading={adding}
          disabled={outOfStock}
          onClick={handleAdd}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {outOfStock ? "স্টক নেই" : "কার্টে যোগ"}
        </Button>
      </div>
    </article>
  );
}
