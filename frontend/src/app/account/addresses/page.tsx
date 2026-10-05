"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { addressesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Address } from "@/types";
import { MapPin, Plus } from "lucide-react";

export default function AddressesPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    district: "Dhaka",
    area: "",
    addressLine: "",
    isDefault: false,
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!token) return;
    addressesApi
      .list(token)
      .then((res) => setList(Array.isArray(res.data) ? res.data : []))
      .catch(() => setList([]));
  }, [token]);

  const update = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const res = await addressesApi.create(form, token);
      if (res.data) setList((prev) => [...prev, res.data!]);
      setShowForm(false);
      setForm({
        fullName: "",
        phone: "",
        district: "Dhaka",
        area: "",
        addressLine: "",
        isDefault: false,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <div className="py-20 text-center text-muted">লোড হচ্ছে...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">ঠিকানা</h1>
          <p className="mt-1 text-sm text-muted">ডেলিভারির জন্য সংরক্ষিত ঠিকানা</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          নতুন
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSave}
          className="mb-8 space-y-3 rounded-craft-md border border-border bg-card p-5 shadow-organic"
        >
          <Input label="নাম *" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          <Input label="ফোন *" required value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          <Input label="জেলা *" required value={form.district} onChange={(e) => update("district", e.target.value)} />
          <Input label="এলাকা *" required value={form.area} onChange={(e) => update("area", e.target.value)} />
          <Input label="বিস্তারিত ঠিকানা *" required value={form.addressLine} onChange={(e) => update("addressLine", e.target.value)} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" loading={saving}>সংরক্ষণ</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>বাতিল</Button>
          </div>
        </form>
      )}

      {list.length === 0 && !showForm ? (
        <div className="flex flex-col items-center rounded-craft-md border border-border bg-card py-16 text-center shadow-organic">
          <MapPin className="mb-3 h-10 w-10 text-muted" />
          <p className="font-display text-lg font-semibold">কোনো ঠিকানা নেই</p>
          <p className="mt-1 text-sm text-muted">চেকআউটেও নতুন ঠিকানা দিতে পারবেন।</p>
          <Button className="mt-5" onClick={() => setShowForm(true)}>ঠিকানা যোগ করুন</Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((a) => (
            <li
              key={a.id}
              className="rounded-craft-md border border-border bg-card p-4 shadow-organic"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {a.fullName}
                    {a.isDefault && (
                      <span className="ml-2 badge-material">Default</span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-muted">{a.phone}</p>
                  <p className="mt-1 text-sm text-muted">
                    {a.addressLine}, {a.area}, {a.district}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link href="/account/profile" className="mt-8 inline-block text-sm text-primary hover:text-primary-hover">
        ← প্রোফাইলে ফিরে যান
      </Link>
    </div>
  );
}
