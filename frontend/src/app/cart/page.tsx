"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { cart, loading, updateQty, removeItem } = useCart();

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted">
        লোড হচ্ছে...
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <ShoppingBag className="mb-4 h-12 w-12 text-muted" />
        <h1 className="font-display text-2xl font-semibold text-foreground">
          কার্ট খালি
        </h1>
        <p className="mt-2 text-sm text-muted">
          এখনো কোনো পণ্য যোগ করেননি। শপ থেকে পছন্দের জিনিস যোগ করুন।
        </p>
        <Link href="/shop" className="mt-8">
          <Button size="lg">শপিং শুরু করুন</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display mb-8 text-3xl font-semibold text-foreground">
        আপনার কার্ট
      </h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const price = Number(
              item.product.salePrice ?? item.product.regularPrice
            );
            const img = item.product.images?.[0]?.url;
            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-craft-md border border-border bg-card p-4 shadow-organic"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-craft-sm bg-secondary">
                  {img ? (
                    <Image
                      src={img}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="font-display text-base font-semibold text-foreground hover:text-primary"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-primary">
                        {formatPrice(price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-craft-sm p-1.5 text-muted transition-craft hover:bg-secondary hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-craft-sm border border-border">
                      <button
                        className="p-2 hover:bg-secondary disabled:opacity-40"
                        onClick={() =>
                          updateQty(item.id, Math.max(1, item.quantity - 1))
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        className="p-2 hover:bg-secondary"
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatPrice(price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-craft-md border border-border bg-card p-6 shadow-organic">
          <h2 className="font-display mb-4 text-lg font-semibold">সারাংশ</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">সাবটোটাল</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">ডেলিভারি</span>
              <span className="text-muted">চেকআউটে হিসাব</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between text-base">
              <span className="font-semibold">মোট</span>
              <span className="font-semibold text-primary">
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>
          <Link href="/checkout" className="mt-6 block">
            <Button size="lg" className="w-full">
              চেকআউট করুন
            </Button>
          </Link>
          <Link
            href="/shop"
            className="mt-3 block text-center text-sm text-muted hover:text-primary"
          >
            কেনাকাটা চালিয়ে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
