import Link from "next/link";
import Image from "next/image";
import { productsApi, categoriesApi } from "@/lib/api";
import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  getDemoFeatured,
  getDemoNewArrivals,
} from "@/lib/demo-data";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import type { Product, Category } from "@/types";
import {
  Leaf,
  Truck,
  ShieldCheck,
  Heart,
  Sparkles,
  PackageCheck,
} from "lucide-react";

async function getHomeData() {
  try {
    const [featured, newArrivals, categories] = await Promise.all([
      productsApi.featured().catch(() => null),
      productsApi.newArrivals().catch(() => null),
      categoriesApi.list().catch(() => null),
    ]);

    const f =
      featured && Array.isArray(featured.data) && featured.data.length
        ? featured.data
        : getDemoFeatured();
    const n =
      newArrivals && Array.isArray(newArrivals.data) && newArrivals.data.length
        ? newArrivals.data
        : getDemoNewArrivals();
    const c =
      categories && Array.isArray(categories.data) && categories.data.length
        ? categories.data
        : DEMO_CATEGORIES;

    return {
      featured: f as Product[],
      newArrivals: n as Product[],
      categories: c as Category[],
    };
  } catch {
    return {
      featured: getDemoFeatured(),
      newArrivals: getDemoNewArrivals(),
      categories: DEMO_CATEGORIES,
    };
  }
}

const FEATURED_CATS = [
  {
    name: "Home Decor",
    bn: "হোম ডেকর",
    slug: "home-decor",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
  },
  {
    name: "Nakshi & Traditional",
    bn: "নকশি ও ঐতিহ্য",
    slug: "nakshi-traditional",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  },
  {
    name: "Handmade & Natural",
    bn: "হাতে তৈরি ও প্রাকৃতিক",
    slug: "jute-natural",
    image:
      "https://images.unsplash.com/photo-1602028432932-c2c923cf29bf?w=800&q=80",
  },
  {
    name: "Gifts",
    bn: "উপহার",
    slug: "gift-sets",
    image:
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80",
  },
];

const REVIEWS = [
  {
    name: "সাদিয়া রহমান",
    text: "পণ্যটি ছবির থেকেও সুন্দর। প্যাকেজিং খুব যত্নসহকারে করা ছিল।",
    rating: 5,
  },
  {
    name: "তানভীর আহমেদ",
    text: "পাটের ঝুড়ি কোয়ালিটি দারুণ। ঘর সাজাতে একদম মানাচ্ছে।",
    rating: 5,
  },
  {
    name: "নুসরাত জাহান",
    text: "নকশি কাঁথার কাজ দেখে মুগ্ধ। ডেলিভারিও সময়মতো পেয়েছি।",
    rating: 5,
  },
];

export default async function HomePage() {
  const { featured, newArrivals } = await getHomeData();
  const bestSellers = featured.length ? featured : DEMO_PRODUCTS.slice(0, 4);
  const premium = DEMO_PRODUCTS.filter((p) => p.isPremium);
  const under500 = DEMO_PRODUCTS.filter(
    (p) => Number(p.salePrice ?? p.regularPrice) <= 500
  );
  const under1000 = DEMO_PRODUCTS.filter((p) => {
    const price = Number(p.salePrice ?? p.regularPrice);
    return price > 500 && price <= 1000;
  });

  return (
    <>
      {/* Trust bar */}
      <div className="border-b border-border bg-secondary/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1.5 px-4 py-2 text-[11px] text-secondary-foreground sm:justify-between sm:text-xs">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-primary" />
            সারা বাংলাদেশে ডেলিভারি
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            ক্যাশ অন ডেলিভারি
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            প্রাকৃতিক উপকরণ
          </span>
          <span className="hidden items-center gap-1.5 md:flex">
            <Heart className="h-3.5 w-3.5 text-primary" />
            হাতে তৈরি কারুশিল্প
          </span>
        </div>
      </div>

      {/* 01 — Hero */}
      <section className="relative min-h-[70vh] overflow-hidden sm:min-h-[78vh]">
        <Image
          src="https://images.unsplash.com/photo-1616046229478-9901c9955e14?w=1800&q=85"
          alt="শিশির কুঞ্জ — ঘর সাজানো"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-foreground)]/80 via-[var(--color-foreground)]/55 to-[var(--color-foreground)]/20" />
        <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:min-h-[78vh]">
          <p className="mb-3 text-xs font-medium tracking-[0.3em] text-accent uppercase sm:text-sm">
            শিশির কুঞ্জ
          </p>
          <h1 className="font-display mb-5 max-w-xl text-4xl font-semibold leading-[1.15] text-white md:text-5xl lg:text-6xl">
            ঘর সাজুক সৌন্দর্য
            <br />
            আর ঐতিহ্যের ছোঁয়ায়।
          </h1>
          <p className="mb-8 max-w-md text-base leading-relaxed text-white/85">
            নির্বাচিত হোম ডেকর, নকশি ও হাতে তৈরি পণ্যের সংগ্রহ — প্রকৃতির ছন্দে
            সাজানো।
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop">
              <Button size="lg" className="min-w-[140px] shadow-lg">
                Shop Now
              </Button>
            </Link>
            <Link href="/shop?featured=true">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[140px] border-white/50 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                Explore Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 02 — Featured Categories (4 big) */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">
            Categories
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold text-foreground md:text-3xl">
            আপনার পছন্দের ক্যাটাগরি
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {FEATURED_CATS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-craft-md border border-border shadow-organic sm:aspect-[3/4]"
            >
              <Image
                src={cat.image}
                alt={cat.bn}
                fill
                className="object-cover transition-craft duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-foreground)]/85 via-[var(--color-foreground)]/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-center sm:p-5">
                <h3 className="font-display text-base font-semibold text-white sm:text-lg">
                  {cat.bn}
                </h3>
                <p className="mt-0.5 hidden text-xs text-white/70 sm:block">
                  {cat.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 03 — New Arrivals */}
      <section className="border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">
                New Arrivals
              </p>
              <h2 className="font-display mt-1 text-2xl font-semibold text-foreground md:text-3xl">
                নতুন আগমন
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-sm font-medium text-primary transition-craft hover:text-primary-hover"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {newArrivals.slice(0, 8).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 04 — Brand Story */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-craft-lg border border-border shadow-organic">
            <Image
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&q=80"
              alt="আমাদের গল্প"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">
              Our Story
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold leading-snug text-foreground md:text-3xl">
              যত্নে বাছাই করা,
              <br />
              আপনার ঘরের জন্য।
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              শিশির কুঞ্জ — সৌন্দর্য, ঐতিহ্য আর ঘরের প্রতি ভালোবাসার মিলনস্থল।
              আমরা পাট, মাটি, তুলা ও হাতে তৈরি কারুশিল্প বেছে নিই, যাতে প্রতিটি
              পণ্যে থাকে প্রকৃতির ছোঁয়া ও কারিগরের মনোযোগ।
            </p>
            <Link href="/about" className="mt-6 inline-block">
              <Button variant="outline">আমাদের সম্পর্কে</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 05 — Best Sellers */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">
                Best Sellers
              </p>
              <h2 className="font-display mt-1 text-2xl font-semibold text-foreground md:text-3xl">
                যা সবচেয়ে বেশি পছন্দ করছেন
              </h2>
              <p className="mt-1 text-sm text-muted">
                আমাদের ক্রেতাদের পছন্দের কিছু পণ্য।
              </p>
            </div>
            <Link
              href="/shop?featured=true"
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {bestSellers.slice(0, 4).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 06 — Collection Banner */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[280px] sm:min-h-[340px]">
          <Image
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80"
            alt="ঐতিহ্যের ছোঁয়া"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[var(--color-foreground)]/65" />
          <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <h2 className="font-display max-w-lg text-3xl font-semibold leading-snug text-white md:text-4xl">
              ঐতিহ্যের ছোঁয়া,
              <br />
              আধুনিক ঘরের জন্য।
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/80">
              নকশি ও প্রাকৃতিক কারুশিল্প — আজকের জীবনযাত্রার সাথে মিলিয়ে।
            </p>
            <Link href="/shop?category=nakshi-traditional" className="mt-6">
              <Button size="lg">Explore Collection</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 07 — Premium Collection */}
      {premium.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium tracking-[0.2em] text-muted uppercase">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Premium
              </p>
              <h2 className="font-display mt-1 text-2xl font-semibold text-foreground md:text-3xl">
                প্রিমিয়াম কালেকশন
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted">
                নির্বাচিত কিছু বিশেষ পণ্য, যাদের সৌন্দর্য আলাদা করে চোখে পড়ে।
              </p>
            </div>
            <Link
              href="/shop?featured=true"
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              Explore Premium →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {premium.slice(0, 4).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 08 — Budget Collection */}
      <section className="border-t border-border bg-secondary/25">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
              সুন্দর কিছু, আপনার বাজেটের মধ্যেই
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/shop?maxPrice=500"
              className="group relative flex min-h-[180px] items-end overflow-hidden rounded-craft-lg border border-border p-6 shadow-organic sm:min-h-[220px]"
            >
              <Image
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80"
                alt="Under 500"
                fill
                className="object-cover transition-craft group-hover:scale-105"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-foreground)]/80 to-transparent" />
              <div className="relative">
                <h3 className="font-display text-2xl font-semibold text-white">
                  Under ৳500
                </h3>
                <p className="mt-1 text-sm text-white/80">
                  {under500.length || "ছোট"} উপহার ও ডেকর
                </p>
                <span className="mt-3 inline-block text-sm font-medium text-accent">
                  Shop Now →
                </span>
              </div>
            </Link>
            <Link
              href="/shop?maxPrice=1000"
              className="group relative flex min-h-[180px] items-end overflow-hidden rounded-craft-lg border border-border p-6 shadow-organic sm:min-h-[220px]"
            >
              <Image
                src="https://images.unsplash.com/photo-1602028432932-c2c923cf29bf?w=800&q=80"
                alt="Under 1000"
                fill
                className="object-cover transition-craft group-hover:scale-105"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-foreground)]/80 to-transparent" />
              <div className="relative">
                <h3 className="font-display text-2xl font-semibold text-white">
                  Under ৳1,000
                </h3>
                <p className="mt-1 text-sm text-white/80">
                  {under1000.length || "নির্বাচিত"} পণ্য
                </p>
                <span className="mt-3 inline-block text-sm font-medium text-accent">
                  Shop Now →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 09 — Why Shishir Kunjo */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            কেন শিশির কুঞ্জ?
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: PackageCheck,
              title: "Carefully Selected",
              bn: "নির্বাচিত পণ্য",
              desc: "প্রতিটি পণ্য যত্নে বাছাই করা।",
            },
            {
              icon: ShieldCheck,
              title: "Quality Checked",
              bn: "মান যাচাইকৃত",
              desc: "কোয়ালিটি চেক করেই পাঠানো হয়।",
            },
            {
              icon: Truck,
              title: "Easy COD",
              bn: "সহজ COD",
              desc: "হাতে পেয়ে টাকা দিবেন।",
            },
            {
              icon: Heart,
              title: "Reliable Delivery",
              bn: "বিশ্বস্ত ডেলিভারি",
              desc: "সারা দেশে নিরাপদ পৌঁছানো।",
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">
                {item.bn}
              </h3>
              <p className="mt-1 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10 — Reviews */}
      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">
              Reviews
            </p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-foreground md:text-3xl">
              ক্রেতাদের কথা
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                className="rounded-craft-md border border-border bg-card p-6 shadow-organic"
              >
                <div className="mb-3 flex gap-0.5 text-accent">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  &ldquo;{r.text}&rdquo;
                </p>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  — {r.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12 — Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-craft-lg border border-border bg-[var(--color-foreground)] px-6 py-12 text-center text-[var(--color-background)] sm:px-12">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            নতুন কালেকশনের খবর পান
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm opacity-80">
            অফার ও নতুন পণ্যের আপডেট পেতে ইমেইল দিন।
          </p>
          <form className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder="আপনার ইমেইল"
              className="flex-1 rounded-craft-md border-0 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button
              type="button"
              className="bg-accent text-[var(--color-foreground)] hover:bg-accent/90"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
