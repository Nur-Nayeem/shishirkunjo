"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { DEMO_PRODUCTS } from "@/lib/demo-data";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items] = useState(() => DEMO_PRODUCTS.slice(0, 3));

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="py-20 text-center text-muted">লোড হচ্ছে...</div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            উইশলিস্ট
          </h1>
          <p className="mt-1 text-sm text-muted">
            আপনার পছন্দের সংরক্ষিত পণ্য
          </p>
        </div>
        <Link href="/account/profile" className="text-sm text-primary hover:text-primary-hover">
          ← অ্যাকাউন্ট
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center rounded-craft-md border border-border bg-card py-20 text-center shadow-organic">
          <Heart className="mb-3 h-10 w-10 text-muted" />
          <p className="font-display text-xl font-semibold">উইশলিস্ট খালি</p>
          <p className="mt-2 text-sm text-muted">
            পছন্দের পণ্যে ♡ চাপলে এখানে দেখাবে।
          </p>
          <Link href="/shop" className="mt-6">
            <Button>Explore Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
