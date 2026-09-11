import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { AdminUser } from "../src/models/AdminUser";
import { ProductCategory } from "../src/models/ProductCategory";
import { Product } from "../src/models/Product";
import { PromotionRule } from "../src/models/PromotionRule";
import { FAQ } from "../src/models/FAQ";
import { Testimonial } from "../src/models/Testimonial";
import { SiteSettings } from "../src/models/SiteSettings";
import {
  slugify,
  MENU_CATEGORIES,
  LEGACY_CATEGORY_SLUGS,
  BAGEL_FLAVORS,
  COOKIE_FLAVORS,
  BAGEL_PACK_VARIANTS,
  COOKIE_PACK_VARIANTS,
  productImagePath,
} from "./menu-data";

function packVariants(
  variants: { name: string; price: number }[]
) {
  return variants.map((v) => ({
    ...v,
    stock: 50,
    inStock: true,
  }));
}

async function seed() {
  await connectDB();
  console.log("Connected to MongoDB");

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@dinoscookiesandbagels.ca";
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "ChangeMe123!";

  const existingAdmin = await AdminUser.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await AdminUser.create({
      email: adminEmail,
      password: hashed,
      name: "Admin",
      role: "superadmin",
    });
    console.log(`Admin created: ${adminEmail}`);
  } else {
    console.log("Admin already exists");
  }

  const categoryMap: Record<string, mongoose.Types.ObjectId> = {};

  for (const cat of MENU_CATEGORIES) {
    const updated = await ProductCategory.findOneAndUpdate(
      { slug: cat.slug },
      {
        $set: {
          name: cat.name,
          description: cat.description,
          startingPrice: cat.startingPrice,
          order: cat.order,
          isActive: true,
          isRequestOnly: false,
        },
      },
      { upsert: true, new: true }
    );
    categoryMap[cat.slug] = updated._id;
    console.log(`Category synced: ${cat.name}`);
  }

  await ProductCategory.updateMany(
    { slug: { $in: LEGACY_CATEGORY_SLUGS } },
    { $set: { isActive: false } }
  );

  const menuProducts: Array<{
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    price: number;
    category: mongoose.Types.ObjectId;
    categorySlug: string;
    media: { url: string; publicId: string; type: "image"; alt: string; order: number }[];
    variants: ReturnType<typeof packVariants>;
    isGlutenFree?: boolean;
    isFeatured?: boolean;
    isPublished: boolean;
    inStock: boolean;
    stock: number;
    tags: string[];
  }> = [];

  for (const flavor of BAGEL_FLAVORS) {
    const slug = slugify(flavor);
    const flavorLabel = flavor.replace(/ Bagel$/i, "").toLowerCase();
    menuProducts.push({
      name: flavor,
      slug,
      shortDescription: `Sourdough ${flavorLabel} bagel — single, 6-pack, or dozen`,
      description: `Hand-rolled sourdough ${flavorLabel} bagel, boiled and baked fresh. Available as a single bagel, 6-pack, or full dozen.`,
      price: 350,
      category: categoryMap.bagels,
      categorySlug: "bagels",
      media: [
        {
          url: productImagePath("bagels", slug),
          publicId: `local/bagels/${slug}`,
          type: "image",
          alt: flavor,
          order: 0,
        },
      ],
      variants: packVariants(BAGEL_PACK_VARIANTS),
      isFeatured: flavor === "Everything",
      isPublished: true,
      inStock: true,
      stock: 50,
      tags: ["bagel", slug],
    });
  }

  for (const flavor of COOKIE_FLAVORS) {
    const slug = slugify(flavor);
    menuProducts.push({
      name: flavor,
      slug,
      shortDescription: `${flavor} — single, 6-pack, or dozen`,
      description: `Fresh-baked ${flavor.toLowerCase()}, made in small batches. Available as a single cookie, 6-pack, or full dozen.`,
      price: 350,
      category: categoryMap.cookies,
      categorySlug: "cookies",
      media: [
        {
          url: productImagePath("cookies", slug),
          publicId: `local/cookies/${slug}`,
          type: "image",
          alt: flavor,
          order: 0,
        },
      ],
      variants: packVariants(COOKIE_PACK_VARIANTS),
      isFeatured: flavor === "Original Favourite Chocolate Chip Cookie",
      isPublished: true,
      inStock: true,
      stock: 50,
      tags: ["cookie", slug],
    });
  }

  menuProducts.push({
    name: "Bagel + Cookie Combo",
    slug: "bagel-cookie-combo",
    shortDescription: "1 bagel and 1 cookie — $6.00",
    description:
      "Pick your favourite bagel and cookie together at a special combo price. Add to cart and choose your flavours in the shop.",
    price: 600,
    category: categoryMap["combo-deals"],
    categorySlug: "combo-deals",
    media: [
      {
        url: productImagePath("combo-deals", "bagel-cookie-combo"),
        publicId: "local/combo-deals/bagel-cookie-combo",
        type: "image",
        alt: "Bagel and cookie combo",
        order: 0,
      },
    ],
    variants: [],
    isFeatured: true,
    isPublished: true,
    inStock: true,
    stock: 50,
    tags: ["combo", "deal"],
  });

  const menuSlugs = menuProducts.map((p) => p.slug);

  await Product.updateMany(
    { slug: { $nin: menuSlugs } },
    { $set: { isPublished: false } }
  );

  for (const prod of menuProducts) {
    await Product.findOneAndUpdate(
      { slug: prod.slug },
      { $set: prod },
      { upsert: true, new: true }
    );
    console.log(`Product synced: ${prod.name}`);
  }

  for (const cat of MENU_CATEGORIES) {
    const count = await Product.countDocuments({
      categorySlug: cat.slug,
      isPublished: true,
    });
    await ProductCategory.findOneAndUpdate(
      { slug: cat.slug },
      { $set: { productCount: count } }
    );
  }

  await PromotionRule.updateMany({}, { $set: { isActive: false } });
  console.log("Legacy promotions deactivated (pricing is in pack variants)");

  const faqs = [
    {
      question: "How does pickup work?",
      answer:
        "Configure pickup instructions, address, and time windows from Admin → Settings. Customers select a preferred date and time during checkout.",
      category: "pickup",
      order: 1,
    },
    {
      question: "Do you offer local delivery?",
      answer:
        "Configure delivery zones and fees from Admin → Delivery. Delivery availability depends on your postal code.",
      category: "delivery",
      order: 2,
    },
    {
      question: "What are your bagel and cookie prices?",
      answer:
        "Single bagels and cookies are $3.50 each. 6-packs are $18.00 and dozens are $30.00. Our Bagel + Cookie combo is $6.00.",
      category: "products",
      order: 3,
    },
    {
      question: "How do pack sizes work?",
      answer:
        "Each bagel and cookie flavour can be ordered as a single item, 6-pack, or full dozen. Choose your pack size when adding to cart.",
      category: "products",
      order: 4,
    },
    {
      question: "How long does order preparation take?",
      answer: "Set your preparation time and order cutoff notice in Admin → Settings.",
      category: "orders",
      order: 5,
    },
    {
      question: "What about allergies?",
      answer:
        "Please contact us directly about allergies and cross-contamination concerns. Our kitchen handles wheat, nuts, dairy, eggs, and other allergens.",
      category: "allergies",
      order: 6,
    },
  ];

  for (const faq of faqs) {
    await FAQ.findOneAndUpdate({ question: faq.question }, { $set: faq }, { upsert: true });
  }
  console.log("FAQs seeded");

  await Testimonial.deleteMany({ isPlaceholder: true });

  const testimonials = [
    {
      name: "Sarah M.",
      content:
        "The chocolate chip cookies are absolutely incredible — chewy, chunky, and made with real butter. My kids fight over them every weekend!",
      rating: 5,
      isPlaceholder: false,
      isPublished: true,
      order: 1,
    },
    {
      name: "James K.",
      content:
        "Best sourdough bagels in the area. Crispy on the outside, perfectly chewy inside. I pick up a dozen every Sunday without fail.",
      rating: 5,
      isPlaceholder: false,
      isPublished: true,
      order: 2,
    },
    {
      name: "Priya R.",
      content:
        "Finally found cookies that actually taste amazing. Dino's has been a game changer for our family — we order every month.",
      rating: 5,
      isPlaceholder: false,
      isPublished: true,
      order: 3,
    },
    {
      name: "Michael T.",
      content:
        "The everything bagels are unreal. You can tell everything is baked fresh with quality ingredients. Pickup is always smooth and friendly.",
      rating: 5,
      isPlaceholder: false,
      isPublished: true,
      order: 4,
    },
    {
      name: "Emily L.",
      content:
        "Ordered a mix of cookies and bagels for a office morning — everyone asked where they were from. Will definitely be back!",
      rating: 5,
      isPlaceholder: false,
      isPublished: true,
      order: 5,
    },
  ];

  for (const t of testimonials) {
    await Testimonial.findOneAndUpdate({ name: t.name }, { $set: t }, { upsert: true });
  }
  console.log("Testimonials seeded");

  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({
      story: `At Dino's Cookies & Bagels, we believe in the simple joy of freshly baked goods made with care. Every bagel is hand-rolled, every cookie is mixed in small batches, and every ingredient is chosen with intention.

We use organic flour, locally sourced ingredients where possible, and our own sourdough starter that has been nurtured over time. Whether you're grabbing a dozen bagels for the family or treating yourself to a warm chocolate chip cookie, we bake everything with the same love we'd serve our own.

Thank you for supporting our small, local bakery. We can't wait to share our bakes with you.`,
      pickup: {
        address: "[Configure your pickup address in Admin → Settings]",
        instructions: "[Add pickup instructions for customers]",
        days: ["[Configure available days]"],
        timeWindows: ["[Configure time windows]"],
        cutoffNotice: "[Set order cutoff notice]",
      },
    });
    console.log("Site settings created");
  }

  console.log("\n✅ Seed complete!");
  console.log(`   ${BAGEL_FLAVORS.length} bagels, ${COOKIE_FLAVORS.length} cookies, 1 combo deal`);
  console.log(`\nAdmin login: ${adminEmail}`);
  console.log(`Admin password: ${adminPassword}`);
  console.log("\n📷 Add product photos to public/images/products/{category}/{slug}.jpg");
  console.log("⚠️  Change the admin password after first login!");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
