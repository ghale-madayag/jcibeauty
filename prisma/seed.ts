import { PrismaClient, type DiscountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const img = (p: string) => `/images/${p}`;

async function main() {
  console.log("Seeding JCI Beauty…");

  // --- Users ---------------------------------------------------------------
  const adminHash = await bcrypt.hash("admin123", 10);
  const customerHash = await bcrypt.hash("customer123", 10);

  const admin = await db.user.upsert({
    where: { email: "admin@jcibeauty.com" },
    update: { emailVerified: new Date() },
    create: {
      email: "admin@jcibeauty.com",
      name: "JCI Admin",
      passwordHash: adminHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  await db.user.upsert({
    where: { email: "customer@jcibeauty.com" },
    update: {},
    create: {
      email: "customer@jcibeauty.com",
      name: "Bella Cruz",
      passwordHash: customerHash,
      role: "CUSTOMER",
      phone: "0917 123 4567",
    },
  });

  // --- Categories ----------------------------------------------------------
  const categoryData = [
    { name: "Skincare", slug: "skincare", image: "category_img_1.jpeg" },
    { name: "Serum", slug: "serum", image: "category_img_2.jpeg" },
    { name: "Moisturizer", slug: "moisturizer", image: "category_img_3.jpeg" },
    { name: "Cleansers", slug: "cleansers", image: "product assets/Cleansers.webp" },
    { name: "Makeup", slug: "makeup", image: "product assets/makeup.webp" },
    { name: "Hair Care", slug: "hair-care", image: "product assets/hair care.webp" },
    { name: "Body Essentials", slug: "body-essentials", image: "product assets/body essentials.webp" },
  ];

  const categories: Record<string, string> = {};
  for (const [i, c] of categoryData.entries()) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, image: img(c.image), sortOrder: i },
      create: {
        name: c.name,
        slug: c.slug,
        image: img(c.image),
        sortOrder: i,
        description: `Premium ${c.name.toLowerCase()} crafted with clinical precision.`,
      },
    });
    categories[c.slug] = cat.id;
  }

  // --- Products ------------------------------------------------------------
  const productData = [
    { name: "Radiance Glow Serum", slug: "radiance-glow-serum", cat: "serum", price: 1299, compare: 1599, image: "product assets/Radiance Glow Serum.webp", featured: true, short: "Brightening vitamin-C serum for luminous, even-toned skin." },
    { name: "Bestseller Radiance Serum", slug: "bestseller-radiance-serum", cat: "serum", price: 1399, image: "bestseller-radiance-serum.webp", featured: true, short: "Our award-winning serum for instant radiance." },
    { name: "Pure Glow Serum", slug: "pure-glow-serum", cat: "serum", price: 1249, image: "serum.webp", short: "Lightweight hydrating serum with hyaluronic acid." },
    { name: "Damascus Rose Toner", slug: "damascus-rose-toner", cat: "skincare", price: 899, image: "product assets/Damascus Rose Toner.webp", short: "Soothing rose toner that refines and balances." },
    { name: "Rose Petal Toner", slug: "rose-petal-toner", cat: "skincare", price: 799, image: "product assets/Rose Petal Toner.webp", short: "Gentle floral toner for daily freshness." },
    { name: "Luminous Daily SPF 50", slug: "luminous-daily-spf-50", cat: "skincare", price: 999, image: "product assets/Luminous Daily SPF 50.webp", featured: true, short: "Weightless broad-spectrum protection with a dewy finish." },
    { name: "Intense Hydra Cream", slug: "intense-hydra-cream", cat: "moisturizer", price: 1199, image: "product assets/Intense Hydra Cream.webp", featured: true, short: "72-hour moisture lock for plump, supple skin." },
    { name: "Hydrating Day Cream", slug: "hydrating-day-cream", cat: "moisturizer", price: 1099, image: "product assets/cream in a bottle.webp", short: "Rich daily cream that softens and protects." },
    { name: "Gentle Cream Cleanser", slug: "gentle-cream-cleanser", cat: "cleansers", price: 699, image: "product assets/cream.webp", short: "Creamy cleanser that purifies without stripping." },
    { name: "Velvet Matte Lipstick", slug: "velvet-matte-lipstick", cat: "makeup", price: 599, compare: 799, image: "product assets/makeup.webp", short: "Long-wear matte color with a velvet feel." },
    { name: "Nourishing Hair Elixir", slug: "nourishing-hair-elixir", cat: "hair-care", price: 1099, image: "product assets/hair care.webp", short: "Restorative oil for silky, frizz-free hair." },
    { name: "Silk Body Lotion", slug: "silk-body-lotion", cat: "body-essentials", price: 749, image: "product assets/lotion.webp", short: "Fast-absorbing lotion for all-day softness." },
  ];

  for (const p of productData) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        compareAtPrice: p.compare ?? null,
        isFeatured: p.featured ?? false,
        categoryId: categories[p.cat],
      },
      create: {
        name: p.name,
        slug: p.slug,
        shortDesc: p.short,
        description: `${p.short}\n\nFormulated by JCI Beauty's medical team, this product blends clinical-grade actives with skin-loving botanicals. Dermatologist tested, cruelty-free, and made with clean ingredients.`,
        price: p.price,
        compareAtPrice: p.compare ?? null,
        stock: 100,
        ratingAvg: 4.5 + Math.random() * 0.5,
        ratingCount: Math.floor(20 + Math.random() * 180),
        isFeatured: p.featured ?? false,
        categoryId: categories[p.cat],
        images: { create: [{ url: img(p.image), alt: p.name, sortOrder: 0 }] },
      },
    });
  }

  // --- Treatment Services --------------------------------------------------
  const serviceData = [
    { name: "OxyGeneo 3-in-1 Facial", slug: "oxygeneo-facial", duration: 90, price: 3500, image: "Hydrating Facial.webp", desc: "Exfoliate, infuse, and oxygenate for instant glow." },
    { name: "Sygmalift Non-Invasive Lifting", slug: "sygmalift-lifting", duration: 60, price: 5000, image: "Anti-Aging Treatment.webp", desc: "Painless ultrasound lifting and contouring." },
    { name: "Advanced Laser Treatment", slug: "advanced-laser", duration: 45, price: 4500, image: "LED Light Therapy Service.webp", desc: "Target pigmentation, scars, and texture." },
    { name: "Clinical Signature Facial", slug: "clinical-facial", duration: 60, price: 2800, image: "Acne Clearing Facial.webp", desc: "A customized deep-cleansing clinical facial." },
    { name: "Chemical Peel", slug: "chemical-peel", duration: 45, price: 2500, image: "Chemical Peel.webp", desc: "Resurface and renew for smoother skin." },
    { name: "Microdermabrasion", slug: "microdermabrasion", duration: 45, price: 2200, image: "Microdermabrasion.webp", desc: "Gentle exfoliation for a refined complexion." },
  ];

  const serviceIds: string[] = [];
  for (const [i, s] of serviceData.entries()) {
    const svc = await db.service.upsert({
      where: { slug: s.slug },
      update: { name: s.name, price: s.price, durationMin: s.duration },
      create: {
        name: s.name,
        slug: s.slug,
        description: s.desc,
        image: img(s.image),
        durationMin: s.duration,
        bufferMin: 15,
        price: s.price,
        sortOrder: i,
      },
    });
    serviceIds.push(svc.id);
  }

  // --- Staff + schedules ---------------------------------------------------
  const staffData = [
    { name: "Dr. Jihan C.", title: "Lead Aesthetic Physician", image: "dr.webp", bio: "Board-certified physician specializing in medical aesthetics." },
    { name: "Maria Santos", title: "Senior Esthetician", image: "kauer.webp", bio: "15+ years crafting bespoke facial treatments." },
    { name: "Ana Reyes", title: "Esthetician", image: "kauer.webp", bio: "Skincare specialist focused on results-driven care." },
  ];

  for (const [i, s] of staffData.entries()) {
    const staff = await db.staff.upsert({
      where: { id: `seed-staff-${i}` },
      update: { name: s.name, title: s.title },
      create: {
        id: `seed-staff-${i}`,
        name: s.name,
        title: s.title,
        bio: s.bio,
        image: img(s.image),
        sortOrder: i,
      },
    });

    // Assign all services to each staff member.
    for (const serviceId of serviceIds) {
      await db.staffService.upsert({
        where: { staffId_serviceId: { staffId: staff.id, serviceId } },
        update: {},
        create: { staffId: staff.id, serviceId },
      });
    }

    // Weekly schedule Mon–Sat 9:00–17:00.
    await db.staffSchedule.deleteMany({ where: { staffId: staff.id } });
    for (let day = 1; day <= 6; day++) {
      await db.staffSchedule.create({
        data: { staffId: staff.id, dayOfWeek: day, startMin: 540, endMin: 1020 },
      });
    }
  }

  // --- Business hours (Mon–Sun 8:00–17:00) --------------------------------
  for (let day = 0; day <= 6; day++) {
    await db.businessHours.upsert({
      where: { dayOfWeek: day },
      update: { openMin: 480, closeMin: 1020, isClosed: false },
      create: { dayOfWeek: day, openMin: 480, closeMin: 1020, isClosed: false },
    });
  }

  // --- Coupons -------------------------------------------------------------
  const coupons: {
    code: string;
    type: DiscountType;
    value: number;
    minSubtotal?: number;
    description: string;
  }[] = [
    { code: "WELCOME10", type: "PERCENT", value: 10, description: "10% off your first order" },
    { code: "GLOW200", type: "FIXED", value: 200, minSubtotal: 1500, description: "₱200 off orders over ₱1,500" },
  ];
  for (const c of coupons) {
    await db.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        type: c.type,
        value: c.value,
        minSubtotal: c.minSubtotal ?? null,
        description: c.description,
      },
    });
  }

  // --- Homepage CMS --------------------------------------------------------
  await db.homepageSection.upsert({
    where: { key: "hero" },
    update: {},
    create: {
      key: "hero",
      title: "Hero Slider",
      sortOrder: 0,
      content: {
        slides: [
          { eyebrow: "The Collection", title: "Radiant By Nature", subtitle: "Premium skincare crafted with clinical precision.", cta: "Shop Now", href: "/shop", image: img("hero-product.webp"), mobileImage: img("hero-product-mobile.webp"), tabletImage: img("hero-product-tablet.webp") },
          { eyebrow: "Hair Alchemist", title: "Nourish & Restore", subtitle: "Luxury hair serums for visible, lasting transformation.", cta: "Shop Hair Care", href: "/shop?category=hair-care", image: img("hero-kauer.webp"), mobileImage: img("hero-kauer-mobile.webp"), tabletImage: img("hero-kauer-tablet.webp") },
          { eyebrow: "Clinical Excellence", title: "We Make You Be More Beautiful", subtitle: "Where medical precision meets radiant self-care.", cta: "Book Appointment", href: "/book", image: img("hero-cleanser.webp"), mobileImage: img("hero-cleanser-mobile.webp"), tabletImage: img("hero-cleanser-tablet.webp") },
        ],
      },
    },
  });

  await db.homepageSection.upsert({
    where: { key: "philosophy" },
    update: {},
    create: {
      key: "philosophy",
      title: "Our Philosophy",
      sortOrder: 3,
      content: {
        heading: "Pure. Effortless. Yours.",
        body: "Every JCI Beauty formula is born from the belief that skincare should be both clinical and indulgent. We combine dermatologist-tested actives with clean, cruelty-free ingredients.",
        image: img("product assets/Our Philosophy.webp"),
      },
    },
  });

  await db.setting.upsert({
    where: { key: "store" },
    update: {},
    create: {
      key: "store",
      value: {
        name: "JCI Beauty",
        email: "operation@jcibeauty.com",
        phone: "0873434",
        freeShippingThreshold: 1999,
      },
    },
  });

  console.log("Seed complete. Admin: admin@jcibeauty.com / admin123");
  console.log(`Admin id: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
