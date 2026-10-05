export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted uppercase">
          শিশির কুঞ্জ
        </p>
        <h1 className="font-display mb-6 max-w-2xl text-4xl font-semibold leading-tight text-foreground md:text-5xl lg:text-6xl">
          ঘর সাজুক সৌন্দর্য
          <br />
          আর ঐতিহ্যের ছোঁয়ায়।
        </h1>
        <p className="mb-10 max-w-md text-base text-muted">
          নির্বাচিত হোম ডেকর, ঐতিহ্যবাহী ও হাতে তৈরি পণ্যের সংগ্রহ।
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button className="rounded-[var(--radius-craft-md)] bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
            Shop Now
          </button>
          <button className="rounded-[var(--radius-craft-md)] border border-border bg-card px-8 py-3.5 text-sm font-medium text-foreground hover:bg-secondary">
            Explore Collection
          </button>
        </div>
      </section>

      <section className="border-t border-border py-10 text-center">
        <p className="text-sm text-muted">
          Design System locked · Phase 1 — Prisma Schema in progress
        </p>
      </section>
    </main>
  );
}
