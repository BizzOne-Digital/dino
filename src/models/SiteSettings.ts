import mongoose, { Schema, type Model } from "mongoose";

export interface ISiteSettings {
  _id: mongoose.Types.ObjectId;
  businessName: string;
  logo: string;
  email: string;
  phone: string;
  socialLinks: { facebook: string; instagram: string };
  heroHeading: string;
  heroDescription: string;
  heroImage: string;
  announcementBar: {
    enabled: boolean;
    message: string;
    pickupNotice: string;
    deliveryNotice: string;
  };
  story: string;
  pickup: {
    address: string;
    instructions: string;
    days: string[];
    timeWindows: string[];
    cutoffNotice: string;
  };
  delivery: {
    enabled: boolean;
    fee: number;
    minimumOrder: number;
    minimumOrderEnabled: boolean;
  };
  taxRate: number;
  stripeEnabled: boolean;
  payOnPickupEnabled: boolean;
  storeOpen: boolean;
  seo: { title: string; description: string };
  allergyDisclaimer: string;
  privacyPolicy: string;
  termsConditions: string;
  refundPolicy: string;
  footerText: string;
  homepageVideo?: { url: string; poster: string; publicId: string };
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    businessName: { type: String, default: "Dino's Cookies & Bagels" },
    logo: { type: String, default: "/images/logo.jpg" },
    email: { type: String, default: "sales@dinoscookiesandbagels.ca" },
    phone: { type: String, default: "905-832-3272" },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
    heroHeading: { type: String, default: "Wildly Fresh. Naturally Baked." },
    heroDescription: {
      type: String,
      default:
        "Organic sourdough bagels, irresistible chocolate chip cookies, and small-batch bakes made with quality local ingredients.",
    },
    heroImage: { type: String, default: "" },
    announcementBar: {
      enabled: { type: Boolean, default: true },
      message: { type: String, default: "Fresh bakes daily — order online for pickup or local delivery!" },
      pickupNotice: { type: String, default: "" },
      deliveryNotice: { type: String, default: "" },
    },
    story: { type: String, default: "" },
    pickup: {
      address: { type: String, default: "[Configure pickup address in admin settings]" },
      instructions: { type: String, default: "" },
      days: { type: [String], default: [] },
      timeWindows: { type: [String], default: [] },
      cutoffNotice: { type: String, default: "" },
    },
    delivery: {
      enabled: { type: Boolean, default: true },
      fee: { type: Number, default: 500 },
      minimumOrder: { type: Number, default: 2500 },
      minimumOrderEnabled: { type: Boolean, default: false },
    },
    taxRate: { type: Number, default: 13 },
    stripeEnabled: { type: Boolean, default: true },
    payOnPickupEnabled: { type: Boolean, default: true },
    storeOpen: { type: Boolean, default: true },
    seo: {
      title: { type: String, default: "Dino's Cookies & Bagels | Organic Home-Baked Goods" },
      description: {
        type: String,
        default:
          "Organic sourdough bagels, chocolate chip cookies, and handcrafted bakes. Pickup and local delivery available.",
      },
    },
    allergyDisclaimer: {
      type: String,
      default:
        "Please contact us directly about allergies and cross-contamination concerns. Our kitchen handles wheat, nuts, dairy, and other allergens.",
    },
    privacyPolicy: { type: String, default: "" },
    termsConditions: { type: String, default: "" },
    refundPolicy: { type: String, default: "" },
    footerText: { type: String, default: "© Dino's Cookies & Bagels. Handcrafted with love." },
    homepageVideo: {
      url: String,
      poster: String,
      publicId: String,
    },
  },
  { timestamps: true }
);

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ??
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export async function getSiteSettings(): Promise<ISiteSettings> {
  const { connectDB } = await import("@/lib/db");
  await connectDB();
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return settings;
}
