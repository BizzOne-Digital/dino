import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getLegacySiteSettingsPatches,
  normalizePublicSiteSettings,
} from "@/lib/site-settings";
import { getSiteSettings, SiteSettings } from "@/models/SiteSettings";
import { PromotionRule } from "@/models/PromotionRule";
import { DiscountCode } from "@/models/DiscountCode";
import { FAQ } from "@/models/FAQ";
import { Testimonial } from "@/models/Testimonial";
import type { SiteSettingsData } from "@/types";

export async function GET() {
  try {
    await connectDB();
    let settings = await getSiteSettings();
    const legacyPatches = getLegacySiteSettingsPatches(settings);
    if (Object.keys(legacyPatches).length > 0) {
      await SiteSettings.updateOne({ _id: settings._id }, { $set: legacyPatches });
      settings = await getSiteSettings();
    }

    const publicSettings = normalizePublicSiteSettings(
      JSON.parse(JSON.stringify(settings)) as SiteSettingsData
    );

    const [promotions, publicCodes, faqs, testimonials] = await Promise.all([
      PromotionRule.find({ isActive: true }).sort({ order: 1 }).lean(),
      DiscountCode.find({
        isActive: true,
        isPublic: true,
        $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gte: new Date() } }],
      }).lean(),
      FAQ.find({ isPublished: true }).sort({ order: 1 }).lean(),
      Testimonial.find({ isPublished: true, isPlaceholder: { $ne: true } }).sort({ order: 1 }).lean(),
    ]);

    return NextResponse.json({
      settings: publicSettings,
      promotions: promotions.map((p) => ({ ...p, _id: p._id.toString() })),
      publicDiscountCodes: publicCodes.map((c) => ({
        code: c.code,
        type: c.type,
        value: c.value,
      })),
      faqs: faqs.map((f) => ({ ...f, _id: f._id.toString() })),
      testimonials: testimonials.map((t) => ({ ...t, _id: t._id.toString() })),
    });
  } catch (error) {
    console.error("Site data error:", error);
    return NextResponse.json({ error: "Failed to fetch site data" }, { status: 500 });
  }
}
