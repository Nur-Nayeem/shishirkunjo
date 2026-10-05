"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  User,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";

const categories = [
  { href: "/shop?category=home-decor", label: "হোম ডেকর" },
  { href: "/shop?category=nakshi-traditional", label: "নকশি ও ঐতিহ্য" },
  { href: "/shop?category=jute-natural", label: "হাতে তৈরি ও প্রাকৃতিক" },
  { href: "/shop?category=gift-sets", label: "উপহার" },
];

const collections = [
  { href: "/shop", label: "নতুন আগমন" },
  { href: "/shop?featured=true", label: "বেস্ট সেলার" },
  { href: "/shop?maxPrice=500", label: "Under ৳500" },
  { href: "/shop?maxPrice=1000", label: "Under ৳1,000" },
  { href: "/shop?featured=true", label: "প্রিমিয়াম" },
];

export function Header() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [colOpen, setColOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-border"
      style={{ background: "color-mix(in srgb, var(--background) 92%, transparent)", backdropFilter: "blur(10px)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          className="rounded-craft-sm p-2 text-foreground lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex flex-col items-start">
          <span className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            শিশির কুঞ্জ
          </span>
          <span className="hidden text-[10px] tracking-[0.2em] text-muted uppercase sm:block">
            Nature · Heritage · Home
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/shop"
            className="rounded-craft-sm px-3 py-2 text-sm font-medium text-foreground/85 transition-craft hover:bg-secondary hover:text-primary"
          >
            Shop
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button className="flex items-center gap-1 rounded-craft-sm px-3 py-2 text-sm font-medium text-foreground/85 transition-craft hover:bg-secondary hover:text-primary">
              Categories <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {catOpen && (
              <div className="absolute left-0 top-full z-50 min-w-[200px] rounded-craft-md border border-border bg-card py-2 shadow-lift">
                {categories.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="block px-4 py-2 text-sm text-foreground transition-craft hover:bg-secondary hover:text-primary"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setColOpen(true)}
            onMouseLeave={() => setColOpen(false)}
          >
            <button className="flex items-center gap-1 rounded-craft-sm px-3 py-2 text-sm font-medium text-foreground/85 transition-craft hover:bg-secondary hover:text-primary">
              Collections <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {colOpen && (
              <div className="absolute left-0 top-full z-50 min-w-[200px] rounded-craft-md border border-border bg-card py-2 shadow-lift">
                {collections.map((c) => (
                  <Link
                    key={c.label}
                    href={c.href}
                    className="block px-4 py-2 text-sm text-foreground transition-craft hover:bg-secondary hover:text-primary"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/about"
            className="rounded-craft-sm px-3 py-2 text-sm font-medium text-foreground/85 transition-craft hover:bg-secondary hover:text-primary"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="rounded-craft-sm px-3 py-2 text-sm font-medium text-foreground/85 transition-craft hover:bg-secondary hover:text-primary"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            className="rounded-craft-sm p-2 text-foreground transition-craft hover:bg-secondary"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href={user ? "/account/wishlist" : "/auth/login"}
            className="hidden rounded-craft-sm p-2 text-foreground transition-craft hover:bg-secondary sm:block"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href={user ? "/account/profile" : "/auth/login"}
            className="rounded-craft-sm p-2 text-foreground transition-craft hover:bg-secondary"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="relative rounded-craft-sm p-2 text-foreground transition-craft hover:bg-secondary"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border bg-card transition-all duration-300",
          searchOpen ? "max-h-20 py-3" : "max-h-0"
        )}
      >
        <form
          className="mx-auto flex max-w-2xl gap-2 px-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) {
              window.location.href = `/shop?search=${encodeURIComponent(q.trim())}`;
            }
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="পণ্য খুঁজুন..."
            className="flex-1 rounded-craft-md border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="rounded-craft-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-craft hover:bg-primary-hover"
          >
            Search
          </button>
        </form>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0"
            style={{ background: "color-mix(in srgb, var(--foreground) 40%, transparent)" }}
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-background shadow-lift">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="font-display text-lg font-semibold">মেনু</span>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 overflow-y-auto p-3">
              <Link href="/shop" onClick={() => setOpen(false)} className="rounded-craft-md px-3 py-2.5 text-sm font-medium hover:bg-secondary">
                সব পণ্য
              </Link>
              <p className="mt-2 px-3 text-[11px] font-semibold tracking-wide text-muted uppercase">Categories</p>
              {categories.map((c) => (
                <Link key={c.href} href={c.href} onClick={() => setOpen(false)} className="rounded-craft-md px-3 py-2 text-sm hover:bg-secondary">
                  {c.label}
                </Link>
              ))}
              <p className="mt-2 px-3 text-[11px] font-semibold tracking-wide text-muted uppercase">Collections</p>
              {collections.map((c) => (
                <Link key={c.label} href={c.href} onClick={() => setOpen(false)} className="rounded-craft-md px-3 py-2 text-sm hover:bg-secondary">
                  {c.label}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              <Link href="/about" onClick={() => setOpen(false)} className="rounded-craft-md px-3 py-2.5 text-sm hover:bg-secondary">About</Link>
              <Link href="/contact" onClick={() => setOpen(false)} className="rounded-craft-md px-3 py-2.5 text-sm hover:bg-secondary">Contact</Link>
              <Link href={user ? "/account/orders" : "/auth/login"} onClick={() => setOpen(false)} className="rounded-craft-md px-3 py-2.5 text-sm font-medium hover:bg-secondary">
                {user ? "আমার অর্ডার" : "লগইন / রেজিস্টার"}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
