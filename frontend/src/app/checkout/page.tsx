"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { ordersApi, deliveryApi, couponsApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const DISTRICTS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
  "Gazipur",
  "Narayanganj",
  "Cumilla",
  "Other",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, refresh } = useCart();
  const { token } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    district: "Dhaka",
    area: "",
    addressLine: "",
    landmark: "",
    notes: "",
    couponCode: "",
  });
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const total = Math.max(0, subtotal + deliveryCharge - discount);

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const calcDelivery = async (district: string) => {
    try {
      const res = await deliveryApi.calculate({
        district,
        area: form.area,
      });
      setDeliveryCharge(res.data?.charge ?? 0);
    } catch {
      setDeliveryCharge(district.toLowerCase().includes("dhaka") ? 60 : 120);
    }
  };

  const applyCoupon = async () => {
    if (!form.couponCode.trim()) return;
    try {
      const res = await couponsApi.validate(form.couponCode.trim(), subtotal);
      setDiscount(res.data?.discount ?? 0);
      setCouponMsg("কুপন প্রয়োগ হয়েছে");
    } catch (e: unknown) {
      setDiscount(0);
      setCouponMsg(e instanceof Error ? e.message : "অবৈধ কুপন");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await ordersApi.place(
        {
          address: {
            fullName: form.fullName,
            phone: form.phone,
            district: form.district,
            area: form.area,
            addressLine: form.addressLine,
            landmark: form.landmark || undefined,
          },
          couponCode: form.couponCode || undefined,
          notes: form.notes || undefined,
        },
        token
      );
      await refresh();
      const orderNumber = res.data?.orderNumber;
      router.push(
        orderNumber ? `/order/${orderNumber}` : "/account/orders"
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "অর্ডার ব্যর্থ হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="py-20 text-center text-muted">লোড হচ্ছে...</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">কার্ট খালি</h1>
        <Link href="/shop" className="mt-6 inline-block">
          <Button>শপিং করুন</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display mb-8 text-3xl font-semibold">চেকআউট</h1>

      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <h2 className="font-display text-lg font-semibold">
            ডেলিভারি ঠিকানা
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="পূর্ণ নাম *"
              required
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
            <Input
              label="মোবাইল নম্বর *"
              required
              placeholder="01XXXXXXXXX"
              pattern="01[3-9][0-9]{8}"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">জেলা *</label>
              <select
                required
                value={form.district}
                onChange={(e) => {
                  update("district", e.target.value);
                  calcDelivery(e.target.value);
                }}
                className="w-full rounded-craft-md border border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="এলাকা / থানা *"
              required
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
            />
          </div>

          <Input
            label="বিস্তারিত ঠিকানা *"
            required
            placeholder="বাড়ি নং, রোড, ব্লক..."
            value={form.addressLine}
            onChange={(e) => update("addressLine", e.target.value)}
          />
          <Input
            label="ল্যান্ডমার্ক (ঐচ্ছিক)"
            value={form.landmark}
            onChange={(e) => update("landmark", e.target.value)}
          />
          <Input
            label="নোট (ঐচ্ছিক)"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />

          <div className="rounded-craft-md border border-border bg-secondary/30 p-4 text-sm text-muted">
            <strong className="text-foreground">পেমেন্ট:</strong> ক্যাশ অন
            ডেলিভারি (COD) — পণ্য হাতে পেয়ে টাকা দিবেন।
          </div>
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-craft-md border border-border bg-card p-6 shadow-organic lg:col-span-2">
          <h2 className="font-display mb-4 text-lg font-semibold">
            অর্ডার সারাংশ
          </h2>
          <ul className="mb-4 space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="text-muted line-clamp-1">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="shrink-0 font-medium">
                  {formatPrice(
                    Number(item.product.salePrice ?? item.product.regularPrice) *
                      item.quantity
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="mb-4 flex gap-2">
            <input
              value={form.couponCode}
              onChange={(e) => update("couponCode", e.target.value)}
              placeholder="কুপন কোড"
              className="flex-1 rounded-craft-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <Button type="button" variant="outline" size="sm" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
          {couponMsg && (
            <p className="mb-3 text-xs text-muted">{couponMsg}</p>
          )}

          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">সাবটোটাল</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">ডেলিভারি</span>
              <span>{formatPrice(deliveryCharge)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span>ছাড়</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>মোট</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full"
            loading={submitting}
          >
            অর্ডার কনফার্ম করুন
          </Button>
        </div>
      </form>
    </div>
  );
}
