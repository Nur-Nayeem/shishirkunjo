import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "আমাদের সম্পর্কে",
  description: "শিশির কুঞ্জ — হাতে তৈরি ও ঐতিহ্যবাহী হোম ডেকরের গল্প।",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-medium tracking-[0.2em] text-muted uppercase">
        About
      </p>
      <h1 className="font-display mt-2 mb-8 text-4xl font-semibold text-foreground">
        আমাদের কথা
      </h1>

      <div className="relative mb-10 aspect-[21/9] overflow-hidden rounded-craft-lg border border-border shadow-organic">
        <Image
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80"
          alt="শিশির কুঞ্জ"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="space-y-5 text-base leading-relaxed text-muted">
        <p>
          <strong className="text-foreground">শিশির কুঞ্জ</strong> — একটি
          ধীরগতির, প্রকৃতি-ঘনিষ্ঠ হোম ডেকর ও উপহারের ব্র্যান্ড। আমরা বিশ্বাস করি
          ঘর শুধু জায়গা নয়; সেখানে থাকে গল্প, স্মৃতি আর কারিগরের হাতের ছোঁয়া।
        </p>
        <p>
          পাট, তুলা, মাটি ও হাতে বোনা কাপড় — এসব প্রাকৃতিক উপকরণ দিয়ে তৈরি
          পণ্য বেছে নিই। নকশি কাঁথা থেকে শুরু করে জুট ব্যাগ, সিরামিক ও কাঠের
          কাজ — প্রতিটিতে থাকে বাংলার ঐতিহ্যের ছাপ।
        </p>
        <p>
          আমাদের লক্ষ্য: প্রিমিয়াম অথচ সহজলভ্য, টেকসই অথচ সুন্দর — এমন পণ্য
          আপনার ঘরে পৌঁছে দেওয়া। Cash on Delivery সহ সারা বাংলাদেশে ডেলিভারি।
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/shop">
          <Button>Shop Now</Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline">যোগাযোগ</Button>
        </Link>
      </div>
    </div>
  );
}
