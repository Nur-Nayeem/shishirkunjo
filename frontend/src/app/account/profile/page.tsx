"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Package,
  Heart,
  MapPin,
  User,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/account/orders", label: "আমার অর্ডার", icon: Package, desc: "অর্ডার ইতিহাস ও ট্র্যাকিং" },
  { href: "/account/wishlist", label: "উইশলিস্ট", icon: Heart, desc: "সংরক্ষিত পণ্য" },
  { href: "/account/addresses", label: "ঠিকানা", icon: MapPin, desc: "ডেলিভারি ঠিকানা" },
];

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="py-20 text-center text-muted">লোড হচ্ছে...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {user.name}
          </h1>
          <p className="text-sm text-muted">{user.email}</p>
          {user.phone && <p className="text-sm text-muted">{user.phone}</p>}
        </div>
      </div>

      <nav className="space-y-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-4 rounded-craft-md border border-border bg-card p-4 shadow-organic transition-craft hover:border-primary/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-craft-sm bg-secondary">
              <l.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{l.label}</p>
              <p className="text-xs text-muted">{l.desc}</p>
            </div>
            <span className="text-muted">→</span>
          </Link>
        ))}
      </nav>

      <Button
        variant="outline"
        className="mt-8 w-full"
        onClick={async () => {
          await logout();
          router.push("/");
        }}
      >
        <LogOut className="h-4 w-4" />
        লগআউট
      </Button>
    </div>
  );
}
