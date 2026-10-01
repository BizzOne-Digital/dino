"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SiteSettingsData } from "@/types";
import {
  AdminButton,
  AdminCard,
  AdminPageHeader,
  inputClass,
  labelClass,
  LoadingState,
} from "@/components/admin/admin-ui";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  function update(path: string, value: unknown) {
    if (!settings) return;
    const keys = path.split(".");
    const updated = { ...settings };
    let obj: Record<string, unknown> = updated as Record<string, unknown>;
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = { ...(obj[keys[i]] as Record<string, unknown>) };
      obj = obj[keys[i]] as Record<string, unknown>;
    }
    obj[keys[keys.length - 1]] = value;
    setSettings(updated);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Settings saved");
    } else {
      toast.error("Failed to save settings");
    }
  }

  if (!settings) return <LoadingState />;

  return (
    <div>
      <AdminPageHeader title="Site Settings" description="Configure your store settings" />

      <form onSubmit={handleSave} className="space-y-6">
        <AdminCard title="Business Info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Business Name</label>
              <input className={inputClass} value={settings.businessName} onChange={(e) => update("businessName", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" className={inputClass} value={settings.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={settings.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Facebook URL</label>
              <input className={inputClass} value={settings.socialLinks.facebook || ""} onChange={(e) => update("socialLinks.facebook", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Instagram URL</label>
              <input className={inputClass} value={settings.socialLinks.instagram || ""} onChange={(e) => update("socialLinks.instagram", e.target.value)} />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings.storeOpen} onChange={(e) => update("storeOpen", e.target.checked)} /> Store Open
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings.stripeEnabled} onChange={(e) => update("stripeEnabled", e.target.checked)} /> Stripe Enabled
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings.payOnPickupEnabled} onChange={(e) => update("payOnPickupEnabled", e.target.checked)} /> Pay on Pickup
              </label>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Hero Section">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Heading</label>
              <input className={inputClass} value={settings.heroHeading} onChange={(e) => update("heroHeading", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea className={inputClass} rows={2} value={settings.heroDescription} onChange={(e) => update("heroDescription", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Hero Image URL</label>
              <input className={inputClass} value={settings.heroImage || ""} onChange={(e) => update("heroImage", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Story</label>
              <textarea className={inputClass} rows={4} value={settings.story} onChange={(e) => update("story", e.target.value)} />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Announcement Bar">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.announcementBar.enabled} onChange={(e) => update("announcementBar.enabled", e.target.checked)} /> Enabled
            </label>
            <div>
              <label className={labelClass}>Message</label>
              <input className={inputClass} value={settings.announcementBar.message} onChange={(e) => update("announcementBar.message", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Pickup Notice</label>
                <input className={inputClass} value={settings.announcementBar.pickupNotice || ""} onChange={(e) => update("announcementBar.pickupNotice", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Delivery Notice</label>
                <input className={inputClass} value={settings.announcementBar.deliveryNotice || ""} onChange={(e) => update("announcementBar.deliveryNotice", e.target.value)} />
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Pickup">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Address</label>
              <input className={inputClass} value={settings.pickup.address} onChange={(e) => update("pickup.address", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Instructions</label>
              <textarea className={inputClass} rows={2} value={settings.pickup.instructions} onChange={(e) => update("pickup.instructions", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Days (comma-separated)</label>
                <input className={inputClass} value={settings.pickup.days.join(", ")} onChange={(e) => update("pickup.days", e.target.value.split(",").map((d) => d.trim()).filter(Boolean))} />
              </div>
              <div>
                <label className={labelClass}>Time Windows (comma-separated)</label>
                <input className={inputClass} value={settings.pickup.timeWindows.join(", ")} onChange={(e) => update("pickup.timeWindows", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Cutoff Notice</label>
              <input className={inputClass} value={settings.pickup.cutoffNotice} onChange={(e) => update("pickup.cutoffNotice", e.target.value)} />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Delivery & Tax">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.delivery.enabled} onChange={(e) => update("delivery.enabled", e.target.checked)} /> Delivery Enabled
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.delivery.minimumOrderEnabled} onChange={(e) => update("delivery.minimumOrderEnabled", e.target.checked)} /> Minimum Order Enabled
            </label>
            <div>
              <label className={labelClass}>Delivery Fee (cents)</label>
              <input type="number" className={inputClass} value={settings.delivery.fee} onChange={(e) => update("delivery.fee", parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className={labelClass}>Minimum Order (cents)</label>
              <input type="number" className={inputClass} value={settings.delivery.minimumOrder} onChange={(e) => update("delivery.minimumOrder", parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className={labelClass}>Tax Rate (%)</label>
              <input type="number" step="0.01" className={inputClass} value={settings.taxRate} onChange={(e) => update("taxRate", parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="SEO">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Page Title</label>
              <input className={inputClass} value={settings.seo.title} onChange={(e) => update("seo.title", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Meta Description</label>
              <textarea className={inputClass} rows={2} value={settings.seo.description} onChange={(e) => update("seo.description", e.target.value)} />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Policies">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Allergy Disclaimer</label>
              <textarea className={inputClass} rows={3} value={settings.allergyDisclaimer} onChange={(e) => update("allergyDisclaimer", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Privacy Policy</label>
              <textarea className={inputClass} rows={4} value={settings.privacyPolicy} onChange={(e) => update("privacyPolicy", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Terms & Conditions</label>
              <textarea className={inputClass} rows={4} value={settings.termsConditions} onChange={(e) => update("termsConditions", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Refund Policy</label>
              <textarea className={inputClass} rows={4} value={settings.refundPolicy} onChange={(e) => update("refundPolicy", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Footer Text</label>
              <input className={inputClass} value={settings.footerText} onChange={(e) => update("footerText", e.target.value)} />
            </div>
          </div>
        </AdminCard>

        <div className="flex justify-end">
          <AdminButton type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
