import { connectDB } from "../src/lib/db";
import { Product } from "../src/models/Product";
import { ProductCategory } from "../src/models/ProductCategory";

async function main() {
  await connectDB();
  const categories = await ProductCategory.find().select("_id slug").lean();
  let updated = 0;
  for (const cat of categories) {
    const result = await Product.updateMany(
      { category: cat._id, categorySlug: { $ne: cat.slug } },
      { $set: { categorySlug: cat.slug, inStock: true } }
    );
    updated += result.modifiedCount;
  }
  console.log(`Synced categorySlug (and inStock) on ${updated} product(s).`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
