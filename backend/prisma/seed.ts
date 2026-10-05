import { PrismaClient, Role, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌿 Seeding Shishir Kunjo database...\n");

  // ── Admin User ─────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { phone: "01700000000" },
    update: {},
    create: {
      name: "Admin",
      phone: "01700000000",
      email: "admin@shishirkunjo.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✓ Admin: ${admin.email} / admin123`);

  // ── Customer ───────────────────────────────
  const customerPassword = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { phone: "01711111111" },
    update: {},
    create: {
      name: "Test Customer",
      phone: "01711111111",
      email: "customer@example.com",
      passwordHash: customerPassword,
      role: Role.CUSTOMER,
    },
  });
  console.log(`✓ Customer: ${customer.email} / customer123`);

  // ── Categories (tree) ──────────────────────
  const homeDecor = await prisma.category.upsert({
    where: { slug: "home-decor" },
    update: {},
    create: {
      name: "Home Decor",
      slug: "home-decor",
      description: "সুন্দর ঘর সাজানোর জিনিস",
      sortOrder: 1,
    },
  });

  const wallDecor = await prisma.category.upsert({
    where: { slug: "wall-decor" },
    update: {},
    create: {
      name: "Wall Decor",
      slug: "wall-decor",
      parentId: homeDecor.id,
      sortOrder: 1,
    },
  });

  const tableDecor = await prisma.category.upsert({
    where: { slug: "table-decor" },
    update: {},
    create: {
      name: "Table Decor",
      slug: "table-decor",
      parentId: homeDecor.id,
      sortOrder: 2,
    },
  });

  const nakshi = await prisma.category.upsert({
    where: { slug: "nakshi-traditional" },
    update: {},
    create: {
      name: "Nakshi & Traditional",
      slug: "nakshi-traditional",
      description: "নকশি ও ঐতিহ্যবাহী পণ্য",
      sortOrder: 2,
    },
  });

  const handmade = await prisma.category.upsert({
    where: { slug: "handmade-natural" },
    update: {},
    create: {
      name: "Handmade & Natural",
      slug: "handmade-natural",
      description: "বাঁশ, বেত, পাট, কাঠের হস্তশিল্প",
      sortOrder: 3,
    },
  });

  const bamboo = await prisma.category.upsert({
    where: { slug: "bamboo" },
    update: {},
    create: {
      name: "Bamboo",
      slug: "bamboo",
      parentId: handmade.id,
      sortOrder: 1,
    },
  });

  const gifts = await prisma.category.upsert({
    where: { slug: "gifts" },
    update: {},
    create: {
      name: "Gifts",
      slug: "gifts",
      description: "উপহার সামগ্রী",
      sortOrder: 4,
    },
  });

  console.log("✓ Categories created");

  // ── Collections ────────────────────────────
  const newArrivals = await prisma.collection.upsert({
    where: { slug: "new-arrivals" },
    update: {},
    create: {
      name: "New Arrivals",
      slug: "new-arrivals",
      sortOrder: 1,
    },
  });

  const bestSellers = await prisma.collection.upsert({
    where: { slug: "best-sellers" },
    update: {},
    create: {
      name: "Best Sellers",
      slug: "best-sellers",
      sortOrder: 2,
    },
  });

  const under500 = await prisma.collection.upsert({
    where: { slug: "under-500" },
    update: {},
    create: {
      name: "Under ৳500",
      slug: "under-500",
      sortOrder: 3,
    },
  });

  const premium = await prisma.collection.upsert({
    where: { slug: "premium-collection" },
    update: {},
    create: {
      name: "Premium Collection",
      slug: "premium-collection",
      sortOrder: 4,
    },
  });

  console.log("✓ Collections created");

  // ── Sample Products ────────────────────────
  const products = [
    {
      name: "Handwoven Bamboo Storage Basket",
      slug: "handwoven-bamboo-storage-basket",
      sku: "SK-HM-0001",
      shortDescription: "প্রাকৃতিক বাঁশের হাতে বোনা স্টোরেজ বাস্কেট",
      description:
        "হাতে তৈরি প্রাকৃতিক বাঁশের স্টোরেজ বাস্কেট। ঘর সাজানোর পাশাপাশি জিনিসপত্র রাখার জন্য উপযোগী।",
      purchasePrice: 350,
      regularPrice: 750,
      salePrice: 650,
      stockQuantity: 25,
      material: "Bamboo",
      color: "Natural",
      isHandmade: true,
      isFeatured: true,
      status: ProductStatus.ACTIVE,
      categoryId: bamboo.id,
      collectionIds: [newArrivals.id, bestSellers.id],
    },
    {
      name: "Terracotta Table Vase",
      slug: "terracotta-table-vase",
      sku: "SK-HD-0001",
      shortDescription: "মাটির তৈরি টেবিল ভ্যাজ",
      description:
        "ঐতিহ্যবাহী টেরাকোটা ভ্যাজ। ফুলদানি হিসেবে বা শোপিস হিসেবে ব্যবহার করা যায়।",
      purchasePrice: 200,
      regularPrice: 550,
      salePrice: null,
      stockQuantity: 15,
      material: "Terracotta",
      color: "Earthy Brown",
      isHandmade: true,
      isFeatured: true,
      status: ProductStatus.ACTIVE,
      categoryId: tableDecor.id,
      collectionIds: [newArrivals.id],
    },
    {
      name: "নকশি কাঁথা — সিঙ্গেল",
      slug: "nakshi-kantha-single",
      sku: "SK-NK-0001",
      shortDescription: "হাতে সেলাই করা নকশি কাঁথা",
      description:
        "বাংলাদেশের ঐতিহ্যবাহী নকশি কাঁথা। সূক্ষ্ম হাতের কাজ ও প্রাকৃতিক রঙ।",
      purchasePrice: 800,
      regularPrice: 1800,
      salePrice: 1600,
      stockQuantity: 8,
      material: "Cotton",
      color: "Multicolor",
      size: "Single",
      isHandmade: true,
      isPremium: true,
      isFeatured: true,
      status: ProductStatus.ACTIVE,
      categoryId: nakshi.id,
      collectionIds: [premium.id, bestSellers.id],
    },
    {
      name: "Jute Table Runner",
      slug: "jute-table-runner",
      sku: "SK-HM-0002",
      shortDescription: "পাটের তৈরি টেবিল রানার",
      description: "প্রাকৃতিক পাটের টেবিল রানার। ডাইনিং টেবিল সাজানোর জন্য আদর্শ।",
      purchasePrice: 150,
      regularPrice: 450,
      salePrice: 399,
      stockQuantity: 30,
      material: "Jute",
      color: "Natural Beige",
      isHandmade: true,
      status: ProductStatus.ACTIVE,
      categoryId: handmade.id,
      collectionIds: [under500.id, newArrivals.id],
    },
    {
      name: "Wooden Wall Clock",
      slug: "wooden-wall-clock",
      sku: "SK-HD-0002",
      shortDescription: "কাঠের ওয়াল ক্লক",
      description: "হাতে তৈরি কাঠের দেয়াল ঘড়ি। মিনিমাল ডিজাইন।",
      purchasePrice: 500,
      regularPrice: 1200,
      salePrice: null,
      stockQuantity: 12,
      material: "Wood",
      color: "Walnut",
      isHandmade: true,
      isPremium: true,
      status: ProductStatus.ACTIVE,
      categoryId: wallDecor.id,
      collectionIds: [premium.id],
    },
    {
      name: "Cane Serving Tray",
      slug: "cane-serving-tray",
      sku: "SK-HM-0003",
      shortDescription: "বেতের সার্ভিং ট্রে",
      description: "হালকা ও মজবুত বেতের ট্রে। চা-নাস্তা পরিবেশনের জন্য।",
      purchasePrice: 180,
      regularPrice: 480,
      salePrice: 420,
      stockQuantity: 20,
      material: "Cane",
      color: "Natural",
      isHandmade: true,
      status: ProductStatus.ACTIVE,
      categoryId: handmade.id,
      collectionIds: [under500.id, bestSellers.id],
    },
  ];

  for (const p of products) {
    const { collectionIds, ...data } = p;
    const product = await prisma.product.upsert({
      where: { sku: data.sku },
      update: {},
      create: {
        ...data,
        description: data.description,
        images: {
          create: [
            {
              imageUrl: `https://placehold.co/600x600/FAF8F5/C45A3F?text=${encodeURIComponent(data.name.slice(0, 20))}`,
              altText: data.name,
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        collections: {
          create: collectionIds.map((collectionId) => ({ collectionId })),
        },
      },
    });

    // Initial inventory transaction
    if (data.stockQuantity > 0) {
      const existing = await prisma.inventoryTransaction.findFirst({
        where: { productId: product.id, type: "ADJUSTMENT" },
      });
      if (!existing) {
        await prisma.inventoryTransaction.create({
          data: {
            productId: product.id,
            type: "ADJUSTMENT",
            quantity: data.stockQuantity,
            previousStock: 0,
            newStock: data.stockQuantity,
            note: "Initial seed stock",
          },
        });
      }
    }
  }
  console.log(`✓ ${products.length} products created`);

  // ── Delivery Settings ──────────────────────
  const settings = [
    { key: "store_name", value: "শিশির কুঞ্জ", type: "STRING" as const },
    { key: "store_phone", value: "01700000000", type: "STRING" as const },
    { key: "store_email", value: "hello@shishirkunjo.com", type: "STRING" as const },
    { key: "local_delivery_charge", value: "60", type: "NUMBER" as const },
    { key: "dhaka_delivery_charge", value: "80", type: "NUMBER" as const },
    { key: "outside_dhaka_delivery_charge", value: "130", type: "NUMBER" as const },
    { key: "free_delivery_threshold", value: "2000", type: "NUMBER" as const },
    { key: "minimum_order_amount", value: "0", type: "NUMBER" as const },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✓ Settings seeded");

  // ── Sample Coupon ──────────────────────────
  await prisma.coupon.upsert({
    where: { code: "SHISHIR10" },
    update: {},
    create: {
      code: "SHISHIR10",
      type: "PERCENTAGE",
      value: 10,
      minimumOrderAmount: 1000,
      maximumDiscount: 200,
      usageLimit: 100,
      isActive: true,
    },
  });
  console.log("✓ Coupon: SHISHIR10 (10% off, min ৳1000)");

  // ── Sample Supplier ────────────────────────
  await prisma.supplier.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Bengal Crafts Ltd",
      phone: "01800000000",
      address: "Savar, Dhaka",
      notes: "Bamboo & jute products supplier",
      status: "ACTIVE",
    },
  });
  console.log("✓ Sample supplier created");

  console.log("\n✅ Seed complete!\n");
  console.log("Admin login:    admin@shishirkunjo.com / admin123");
  console.log("Customer login: customer@example.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
