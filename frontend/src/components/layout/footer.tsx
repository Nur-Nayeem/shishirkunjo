import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border" style={{ background: "var(--secondary)" }}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="font-display text-2xl font-semibold text-foreground">
              শিশির কুঞ্জ
            </Link>
            <p className="text-sm leading-relaxed text-muted">
              ঘর সাজুক সৌন্দর্য আর ঐতিহ্যের ছোঁয়ায়। হাতে তৈরি, প্রাকৃতিক ও
              নির্বাচিত হোম ডেকর।
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wide text-foreground uppercase">
              Shop
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/shop", label: "সব পণ্য" },
                { href: "/shop?category=home-decor", label: "হোম ডেকর" },
                { href: "/shop?category=jute-natural", label: "হাতে তৈরি" },
                { href: "/shop?featured=true", label: "প্রিমিয়াম" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition-craft hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wide text-foreground uppercase">
              Customer Care
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/contact", label: "যোগাযোগ" },
                { href: "/faq", label: "FAQ" },
                { href: "/account/orders", label: "Order Tracking" },
                { href: "/policies/returns", label: "রিটার্ন নীতি" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition-craft hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wide text-foreground uppercase">
              Info
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "আমাদের কথা" },
                { href: "/policies/privacy", label: "গোপনীয়তা" },
                { href: "/policies/terms", label: "শর্তাবলী" },
                { href: "/policies/shipping", label: "ডেলিভারি" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition-craft hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} শিশির কুঞ্জ। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="text-xs text-muted">Cash on Delivery · সারা বাংলাদেশ</p>
        </div>
      </div>
    </footer>
  );
}
