"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      router.push("/account/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "রেজিস্টার ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display mb-2 text-center text-3xl font-semibold">
        রেজিস্টার
      </h1>
      <p className="mb-8 text-center text-sm text-muted">
        নতুন অ্যাকাউন্ট তৈরি করুন
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="নাম *"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
        <Input
          label="ইমেইল *"
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <Input
          label="মোবাইল (ঐচ্ছিক)"
          placeholder="01XXXXXXXXX"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
        <Input
          label="পাসওয়ার্ড *"
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          অ্যাকাউন্ট তৈরি করুন
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        আগে থেকে অ্যাকাউন্ট আছে?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:text-primary-hover">
          লগইন করুন
        </Link>
      </p>
    </div>
  );
}
