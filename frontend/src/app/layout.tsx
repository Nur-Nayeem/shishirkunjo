import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: {
    default: "শিশির কুঞ্জ | হাতে তৈরি হোম ডেকর ও উপহার",
    template: "%s | শিশির কুঞ্জ",
  },
  description:
    "নির্বাচিত হোম ডেকর, ঐতিহ্যবাহী ও হাতে তৈরি পণ্যের সংগ্রহ। ঘর সাজুক সৌন্দর্য আর ঐতিহ্যের ছোঁয়ায়।",
  keywords: [
    "home decor",
    "handmade",
    "nakshi",
    "jute",
    "bangladesh",
    "gift",
    "শিশির কুঞ্জ",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
