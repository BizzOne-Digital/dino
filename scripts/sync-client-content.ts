/**
 * Updates live MongoDB content for client-requested storefront changes (FAQs, tax, plush, combo price).
 * Run: npm run sync-content
 */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { FAQ } from "../src/models/FAQ";
import { Product } from "../src/models/Product";
import { ProductCategory } from "../src/models/ProductCategory";
import { PromotionRule } from "../src/models/PromotionRule";
import { SiteSettings } from "../src/models/SiteSettings";
import { MENU_CATEGORIES, COMBO_PRODUCT_SLUG } from "./menu-data";

const CLIENT_FAQS = [
  {
    question: "How does pickup work?",
    answer:
      "Select pickup at checkout and choose your preferred date and time. Pickup details and address are confirmed in your order email.",
    category: "pickup",
    order: 1,
  },
  {
    question: "Do you offer local delivery?",
    answer: "No delivery at this time.",
    category: "delivery",
    order: 2,
  },
  {
    question: "Do you offer gluten-free options?",
    answer: "No, at this time.",
    category: "dietary",
    order: 3,
  },
  {
    question: "What are your bagel and cookie prices?",
    answer:
      "Single bagels and cookies are $3.50 each. 6-packs are $18.00 and dozens are $30.00. Our Bagel + Cookie combo is $7.00.",
    category: "products",
    order: 4,
  },
  {
    question: "How do pack sizes work?",
    answer:
      "Each bagel and cookie flavour can be ordered as a single item, 6-pack, or full dozen. Choose your pack size when adding to cart.",
    category: "products",
    order: 5,
  },
  {
    question: "How long does order preparation take?",
    answer: "Normally 2–3 days depending on the item ordered.",
    category: "orders",
    order: 6,
  },
  {
    question: "What about allergies?",
    answer:
      "Please contact us directly about allergies and cross-contamination concerns. Our kitchen handles wheat, nuts, dairy, eggs, and other allergens.",
    category: "allergies",
    order: 7,
  },
];

async function sync() {
  await connectDB();

  for (const cat of MENU_CATEGORIES) {
    await ProductCategory.findOneAndUpdate(
      { slug: cat.slug },
      {
        $set: {
          name: cat.name,
          description: cat.description,
          startingPrice: cat.startingPrice,
          order: cat.order,
          image: cat.image,
          isActive: true,
        },
      },
      { upsert: true }
    );
  }

  await ProductCategory.updateMany(
    { slug: { $in: ["merchandise", "gluten-free"] } },
    { $set: { isActive: false } }
  );

  await Product.updateMany(
    { slug: { $in: ["dino-plush"] } },
    { $set: { isPublished: false } }
  );

  await Product.updateOne(
    { slug: COMBO_PRODUCT_SLUG },
    {
      $set: {
        price: 700,
        shortDescription: "1 bagel and 1 cookie — $7.00",
      },
    }
  );

  await PromotionRule.updateMany(
    { name: /plush/i },
    { $set: { isActive: false } }
  );

  await FAQ.deleteMany({
    question: {
      $in: [
        "How does the free Dino plush promotion work?",
        "How fresh are the cookies and bagels?",
        "Can I pay when I pick up?",
        "What areas do you deliver to?",
      ],
    },
  });

  for (const faq of CLIENT_FAQS) {
    await FAQ.findOneAndUpdate({ question: faq.question }, { $set: { ...faq, isPublished: true } }, { upsert: true });
  }

  await SiteSettings.updateMany(
    {},
    {
      $set: {
        taxRate: 0,
        payOnPickupEnabled: false,
        "delivery.enabled": false,
        announcementBar: {
          enabled: true,
          message: "Order baked goods online for pickup — we bake fresh with care.",
        },
      },
    }
  );

  console.log("✅ Client content synced (FAQs, tax 0%, plush hidden, combo $7, sourdough category).");
  await mongoose.disconnect();
}

sync().catch((err) => {
  console.error(err);
  process.exit(1);
});
