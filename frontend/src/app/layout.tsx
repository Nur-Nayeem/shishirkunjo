import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "শিশির কুঞ্জ | Shishir Kunjo",
    template: "%s | শিশির কুঞ্জ",
  },
  description:
    "ঘর সাজুক সৌন্দর্য আর ঐতিহ্যের ছোঁয়ায়। নির্বাচিত হোম ডেকর, নকশি, হাতে তৈরি ও গিফট পণ্য।",
  keywords: [
    "home decor",
    "nakshi",
    "handmade",
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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
