"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ordersApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

export default function OrdersPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      router.replace("/auth/login");
      return;
    }
    (async () => {
      try {
        const res = await ordersApi.mine(token);
        setOrders(res.data ?? []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, token, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="py-20 text-center text-muted">লোড হচ্ছে...</div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display mb-8 text-3xl font-semibold">আমার অর্ডার</h1>

      {orders.length === 0 ? (
        <div className="rounded-craft-md border border-border bg-card py-16 text-center">
          <p className="text-muted">এখনো কোনো অর্ডার নেই।</p>
          <Link
            href="/shop"
            className="mt-4 inline-block text-sm font-medium text-primary"
          >
            শপিং শুরু করুন →
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-craft-md border border-border bg-card p-5 shadow-organic"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/order/${o.orderNumber}`}
                    className="font-display text-lg font-semibold text-foreground hover:text-primary"
                  >
                    {o.orderNumber}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(o.createdAt).toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {formatPrice(o.total)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {o.status} · {o.paymentStatus}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">
                {o.items?.length ?? 0} টি পণ্য
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
