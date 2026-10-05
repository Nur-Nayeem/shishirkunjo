"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/account/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "লগইন ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display mb-2 text-center text-3xl font-semibold">
        লগইন
      </h1>
      <p className="mb-8 text-center text-sm text-muted">
        অ্যাকাউন্টে প্রবেশ করুন
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="ইমেইল"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          label="পাসওয়ার্ড"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          লগইন করুন
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        অ্যাকাউন্ট নেই?{" "}
        <Link href="/auth/register" className="font-medium text-primary hover:text-primary-hover">
          রেজিস্টার করুন
        </Link>
      </p>
    </div>
  );
}
