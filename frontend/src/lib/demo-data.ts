import type { Product, Category, Banner } from "@/types";

/** Reliable product imagery (Unsplash CDN) */
const img = {
  jute1: "https://images.unsplash.com/photo-1594040226829-7f251ab1dfbc?auto=format&fit=crop&w=900&q=80",
  jute2: "https://images.unsplash.com/photo-1602028432932-c2c923cf29bf?auto=format&fit=crop&w=900&q=80",
  pottery: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
  ceramic: "https://images.unsplash.com/photo-1610701596007-1150287dcabb?auto=format&fit=crop&w=900&q=80",
  textile: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
  plant: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80",
  wood: "https://images.unsplash.com/photo-1533090161767-e6ffedbbf36f?auto=format&fit=crop&w=900&q=80",
  cushion: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
  lamp: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
  mat: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
  vase: "https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&w=900&q=80",
  basket2: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=80",
  candle: "https://images.unsplash.com/photo-1602607620671-c0c0b0b0b0b0?auto=format&fit=crop&w=900&q=80",
  mirror: "https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=900&q=80",
  bowl: "https://images.unsplash.com/photo-1610701596061-2ecf263e0ae6?auto=format&fit=crop&w=900&q=80",
  // Shop hero — bright interior living room
  hero: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=80",
  hero2: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1800&q=80",
  cat1: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
  cat2: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80",
  cat3: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80",
  cat4: "https://images.unsplash.com/photo-1594040226829-7f251ab1dfbc?auto=format&fit=crop&w=600&q=80",
};

function p(
  partial: Partial<Product> & {
    id: string;
    name: string;
    slug: string;
    regularPrice: number;
  }
): Product {
  return {
    shortDescription:
      partial.shortDescription ?? "হাতে তৈরি, প্রাকৃতিক উপকরণে সাজানো।",
    stockQuantity: partial.stockQuantity ?? 12,
    isHandmade: partial.isHandmade ?? true,
    isPremium: partial.isPremium ?? false,
    isFeatured: partial.isFeatured ?? false,
    status: "ACTIVE",
    images: partial.images ?? [{ id: "1", url: img.jute1, isPrimary: true }],
    category: partial.category ?? {
      id: "c1",
      name: "হোম ডেকর",
      slug: "home-decor",
    },
    ...partial,
  };
}

export const DEMO_CATEGORIES: Category[] = [
  { id: "c1", name: "হোম ডেকর", slug: "home-decor", imageUrl: img.cat1 },
  { id: "c2", name: "পাট ও প্রাকৃতিক", slug: "jute-natural", imageUrl: img.cat4 },
  { id: "c3", name: "সিরামিক ও মাটি", slug: "ceramic", imageUrl: img.cat3 },
  { id: "c4", name: "টেক্সটাইল", slug: "textile", imageUrl: img.cat2 },
  { id: "c5", name: "উপহার সেট", slug: "gift-sets", imageUrl: img.wood },
  { id: "c6", name: "প্ল্যান্টার", slug: "planters", imageUrl: img.plant },
];

export const DEMO_PRODUCTS: Product[] = [
  p({
    id: "1",
    name: "হাতে বোনা পাটের ঝুড়ি",
    slug: "handmade-jute-basket",
    regularPrice: 1200,
    salePrice: 950,
    shortDescription: "প্রাকৃতিক পাট দিয়ে হাতে বোনা মজবুত ঝুড়ি।",
    isFeatured: true,
    isHandmade: true,
    material: "১০০% পাট",
    images: [{ id: "1", url: img.jute1, isPrimary: true }],
    category: { id: "c2", name: "পাট ও প্রাকৃতিক", slug: "jute-natural" },
  }),
  p({
    id: "2",
    name: "মাটির হস্তশিল্প ফুলদানি",
    slug: "clay-artisan-vase",
    regularPrice: 850,
    shortDescription: "ঐতিহ্যবাহী মাটির কাজ — প্রাকৃতিক রঙে ফিনিশ।",
    isFeatured: true,
    isPremium: true,
    material: "মাটি",
    images: [{ id: "1", url: img.pottery, isPrimary: true }],
    category: { id: "c3", name: "সিরামিক ও মাটি", slug: "ceramic" },
  }),
  p({
    id: "3",
    name: "নকশি কাঁথা কুশন কভার",
    slug: "nakshi-kantha-cushion",
    regularPrice: 650,
    salePrice: 520,
    shortDescription: "হাতে সেলাই নকশি কাঁথার কুশন।",
    isFeatured: true,
    material: "তুলা",
    images: [{ id: "1", url: img.textile, isPrimary: true }],
    category: { id: "c4", name: "টেক্সটাইল", slug: "textile" },
  }),
  p({
    id: "4",
    name: "কাঠের মিনিমাল ল্যাম্প",
    slug: "minimal-wood-lamp",
    regularPrice: 2200,
    salePrice: 1890,
    shortDescription: "প্রাকৃতিক কাঠের ফ্রেম — নরম আলো।",
    isPremium: true,
    isFeatured: true,
    material: "কাঠ",
    images: [{ id: "1", url: img.lamp, isPrimary: true }],
    category: { id: "c1", name: "হোম ডেকর", slug: "home-decor" },
  }),
  p({
    id: "5",
    name: "টেরাকোটা প্ল্যান্টার সেট",
    slug: "terracotta-planter-set",
    regularPrice: 980,
    shortDescription: "৩ পিসের টেরাকোটা প্ল্যান্টার।",
    isHandmade: true,
    material: "টেরাকোটা",
    images: [{ id: "1", url: img.plant, isPrimary: true }],
    category: { id: "c6", name: "প্ল্যান্টার", slug: "planters" },
  }),
  p({
    id: "6",
    name: "পাটের রানার ম্যাট",
    slug: "jute-runner-mat",
    regularPrice: 1450,
    salePrice: 1199,
    shortDescription: "প্রাকৃতিক পাটের রানার ম্যাট।",
    isHandmade: true,
    material: "পাট",
    images: [{ id: "1", url: img.mat, isPrimary: true }],
    category: { id: "c2", name: "পাট ও প্রাকৃতিক", slug: "jute-natural" },
  }),
  p({
    id: "7",
    name: "সিরামিক সার্ভিং বাটি",
    slug: "ceramic-serving-bowl",
    regularPrice: 750,
    shortDescription: "হাতে তৈরি সিরামিক বাটি।",
    isPremium: true,
    material: "সিরামিক",
    images: [{ id: "1", url: img.ceramic, isPrimary: true }],
    category: { id: "c3", name: "সিরামিক ও মাটি", slug: "ceramic" },
  }),
  p({
    id: "8",
    name: "ঐতিহ্য উপহার বক্স",
    slug: "heritage-gift-box",
    regularPrice: 2500,
    salePrice: 2100,
    shortDescription: "পাট ঝুড়ি + নকশি + মাটির মিনি ফুলদানি।",
    isFeatured: true,
    isPremium: true,
    images: [{ id: "1", url: img.wood, isPrimary: true }],
    category: { id: "c5", name: "উপহার সেট", slug: "gift-sets" },
  }),
  p({
    id: "9",
    name: "বেতের ওয়াল ডেকর",
    slug: "cane-wall-decor",
    regularPrice: 1100,
    shortDescription: "হাতে বোনা বেতের ওয়াল আর্ট।",
    isHandmade: true,
    images: [{ id: "1", url: img.basket2, isPrimary: true }],
    category: { id: "c1", name: "হোম ডেকর", slug: "home-decor" },
  }),
  p({
    id: "10",
    name: "ম্যাক্রামে ওয়াল হ্যাঙ্গিং",
    slug: "macrame-wall-hanging",
    regularPrice: 1350,
    salePrice: 1150,
    shortDescription: "তুলার দড়ি দিয়ে হাতে বোনা ম্যাক্রামে।",
    isHandmade: true,
    images: [{ id: "1", url: img.cushion, isPrimary: true }],
    category: { id: "c4", name: "টেক্সটাইল", slug: "textile" },
  }),
  p({
    id: "11",
    name: "মাটির মিনি বাটি সেট",
    slug: "clay-mini-bowl-set",
    regularPrice: 680,
    shortDescription: "৪ পিসের হস্তশিল্প বাটি সেট।",
    isHandmade: true,
    images: [{ id: "1", url: img.bowl, isPrimary: true }],
    category: { id: "c3", name: "সিরামিক ও মাটি", slug: "ceramic" },
  }),
  p({
    id: "12",
    name: "কাঠের মিরর ফ্রেম",
    slug: "wood-mirror-frame",
    regularPrice: 2800,
    isPremium: true,
    shortDescription: "প্রাকৃতিক কাঠের হাতে তৈরি মিরর।",
    images: [{ id: "1", url: img.mirror, isPrimary: true }],
    category: { id: "c1", name: "হোম ডেকর", slug: "home-decor" },
  }),
];

export const DEMO_BANNERS: Banner[] = [
  {
    id: "b1",
    title: "ঘর সাজুক সৌন্দর্যে",
    subtitle: "হাতে তৈরি · প্রাকৃতিক · ঐতিহ্যবাহী",
    imageUrl: img.hero,
    linkUrl: "/shop",
    buttonText: "কালেকশন দেখুন",
  },
];

export function getDemoProductBySlug(slug: string): Product | undefined {
  return DEMO_PRODUCTS.find((x) => x.slug === slug);
}

export function getDemoFeatured(): Product[] {
  return DEMO_PRODUCTS.filter((x) => x.isFeatured);
}

export function getDemoNewArrivals(): Product[] {
  return [...DEMO_PRODUCTS].reverse().slice(0, 6);
}
