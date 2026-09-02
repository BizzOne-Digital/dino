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

async function seed() {
  await connectDB();
  console.log("Connected to MongoDB");

  // Admin user
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

  // Categories
  const categories = [
    {
      name: "Sourdough Bagels",
      slug: "bagels",
      description: "Hand-rolled, boiled, and baked to perfection using our signature sourdough starter.",
      startingPrice: 350,
      productCount: 0,
      order: 1,
    },
    {
      name: "Chocolate Chip Cookies",
      slug: "cookies",
      description: "Thick, chewy cookies loaded with premium chocolate chips.",
      startingPrice: 300,
      productCount: 0,
      order: 2,
    },
    {
      name: "Gluten-Free Bakes",
      slug: "gluten-free",
      description: "Delicious gluten-free options made with care.",
      startingPrice: 400,
      productCount: 0,
      order: 3,
    },
    {
      name: "English Muffins",
      slug: "english-muffins",
      description: "Sourdough English muffins with a perfect nooks-and-crannies texture.",
      startingPrice: 450,
      productCount: 0,
      order: 4,
    },
    {
      name: "Sourdough Bread",
      slug: "sourdough-bread",
      description: "Artisan sourdough loaves available by request.",
      isRequestOnly: true,
      productCount: 0,
      order: 5,
    },
  ];

  const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const cat of categories) {
    const existing = await ProductCategory.findOne({ slug: cat.slug });
    if (existing) {
      categoryMap[cat.slug] = existing._id;
    } else {
      const created = await ProductCategory.create(cat);
      categoryMap[cat.slug] = created._id;
      console.log(`Category created: ${cat.name}`);
    }
  }

  // Products
  const sampleProducts = [
    {
      name: "Everything Sourdough Bagel",
      slug: "sample-everything-bagel",
      shortDescription: "Classic everything bagel with sesame, poppy & more",
      description: "Hand-rolled sourdough bagel topped with everything seasoning. Boiled and baked fresh daily.",
      price: 350,
      category: categoryMap["bagels"],
      categorySlug: "bagels",
      isPublished: true,
      inStock: true,
      stock: 20,
      tags: ["bagel", "everything"],
    },
    {
      name: "Classic Chocolate Chip Cookie",
      slug: "sample-chocolate-chip-cookie",
      shortDescription: "Thick, chewy, loaded with chocolate chips",
      description: "Our signature chocolate chip cookie — crispy edges, soft centre, and plenty of premium chocolate chips.",
      price: 300,
      category: categoryMap["cookies"],
      categorySlug: "cookies",
      isPublished: true,
      inStock: true,
      stock: 30,
      isFeatured: true,
      tags: ["cookie", "chocolate-chip"],
    },
    {
      name: "Gluten-Free Double Chocolate Cookie",
      slug: "sample-gf-double-chocolate",
      shortDescription: "Rich double chocolate, gluten-free",
      description: "Decadent gluten-free cookie made with rich cocoa and chocolate chunks.",
      price: 450,
      category: categoryMap["gluten-free"],
      categorySlug: "gluten-free",
      isGlutenFree: true,
      isPublished: true,
      inStock: true,
      stock: 15,
      tags: ["gluten-free", "cookie"],
    },
    {
      name: "Sourdough English Muffin (6-pack)",
      slug: "sample-english-muffin-6pack",
      shortDescription: "Six sourdough English muffins per pack",
      description: "Perfect nooks and crannies for toasting. Made with our signature sourdough starter.",
      price: 900,
      category: categoryMap["english-muffins"],
      categorySlug: "english-muffins",
      isPublished: true,
      inStock: true,
      stock: 10,
      tags: ["english-muffin"],
    },
    {
      name: "Artisan Sourdough Loaf (By Request)",
      slug: "sample-sourdough-loaf",
      shortDescription: "Available by request only",
      description: "Custom artisan sourdough loaves available by request. Contact us or add a note at checkout.",
      price: 1200,
      category: categoryMap["sourdough-bread"],
      categorySlug: "sourdough-bread",
      isRequestOnly: true,
      isPublished: true,
      inStock: true,
      stock: 0,
      tags: ["sourdough", "request-only"],
    },
  ];

  for (const prod of sampleProducts) {
    const exists = await Product.findOne({ slug: prod.slug });
    if (!exists) {
      await Product.create(prod);
      await ProductCategory.findByIdAndUpdate(prod.category, { $inc: { productCount: 1 } });
      console.log(`Product created: ${prod.name}`);
    } else {
      await Product.findOneAndUpdate({ slug: prod.slug }, { $set: prod });
      console.log(`Product updated: ${prod.name}`);
    }
  }

  // Promotion rules
  const promotions = [
    { name: "Buy 6 Get 1 Free", buyQuantity: 6, freeQuantity: 1, order: 1 },
    { name: "Buy 12 Get 2 Free", buyQuantity: 12, freeQuantity: 2, order: 2 },
    { name: "Buy 24 Get 4 Free", buyQuantity: 24, freeQuantity: 4, order: 3 },
  ];

  for (const promo of promotions) {
    const exists = await PromotionRule.findOne({ name: promo.name });
    if (!exists) {
      await PromotionRule.create({ ...promo, isActive: true, stackable: false });
      console.log(`Promotion created: ${promo.name}`);
    }
  }

  // FAQs
  const faqs = [
    {
      question: "How does pickup work?",
      answer: "[PLACEHOLDER] Configure pickup instructions, address, and time windows from Admin → Settings. Customers will select a preferred date and time during checkout.",
      category: "pickup",
      order: 1,
    },
    {
      question: "Do you offer local delivery?",
      answer: "[PLACEHOLDER] Configure delivery zones and fees from Admin → Delivery. Delivery availability depends on your postal code.",
      category: "delivery",
      order: 2,
    },
    {
      question: "Do you have gluten-free options?",
      answer: "Yes! We offer select gluten-free bakes. Look for the gluten-free badge on products in our shop. Please contact us about cross-contamination concerns.",
      category: "dietary",
      order: 3,
    },
    {
      question: "Can I request sourdough bread?",
      answer: "Absolutely! Our artisan sourdough loaves are available by request. Use the contact form or note it in your order inquiry.",
      category: "products",
      order: 4,
    },
    {
      question: "How do the buy-more-get-free promotions work?",
      answer: "When you buy 6 items you get 1 free, buy 12 get 2 free, or buy 24 get 4 free. Free items are calculated automatically in your cart before checkout.",
      category: "promotions",
      order: 5,
    },
    {
      question: "How long does order preparation take?",
      answer: "[PLACEHOLDER] Set your preparation time and order cutoff notice in Admin → Settings.",
      category: "orders",
      order: 6,
    },
    {
      question: "What about allergies?",
      answer: "Please contact us directly about allergies and cross-contamination concerns. Our kitchen handles wheat, nuts, dairy, eggs, and other allergens.",
      category: "allergies",
      order: 7,
    },
  ];

  for (const faq of faqs) {
    const exists = await FAQ.findOne({ question: faq.question });
    if (!exists) {
      await FAQ.create(faq);
    }
  }
  console.log("FAQs seeded");

  // Testimonials — remove placeholders, seed real reviews
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
        "Finally found gluten-free cookies that actually taste amazing. Dino's has been a game changer for our family — we order every month.",
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

  // Site settings
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
  console.log(`\nAdmin login: ${adminEmail}`);
  console.log(`Admin password: ${adminPassword}`);
  console.log("\n⚠️  Change the admin password after first login!");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
