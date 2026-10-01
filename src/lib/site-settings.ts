import type { SiteSettingsData } from "@/types";
import { BUSINESS_PHONE_DISPLAY } from "@/lib/utils";

const LEGACY_PHONE_DIGITS = "9058323272";

const PLACEHOLDER_ADDRESS_MARKERS = [
  "configure your pickup address",
  "configure pickup address",
  "admin → settings",
  "admin -> settings",
];

export function isPlaceholderPickupAddress(address?: string | null): boolean {
  if (!address?.trim()) return true;
  const lower = address.toLowerCase();
  if (lower.startsWith("[") && lower.includes("configure")) return true;
  return PLACEHOLDER_ADDRESS_MARKERS.some((marker) => lower.includes(marker));
}

export function normalizeBusinessPhone(phone?: string | null): string {
  if (!phone?.trim()) return BUSINESS_PHONE_DISPLAY;
  const digits = phone.replace(/\D/g, "");
  if (digits === LEGACY_PHONE_DIGITS || phone.trim() === "905-832-3272") {
    return BUSINESS_PHONE_DISPLAY;
  }
  return phone.trim();
}

export function normalizePublicSiteSettings<T extends SiteSettingsData>(settings: T): T {
  const pickupAddress = isPlaceholderPickupAddress(settings.pickup?.address)
    ? ""
    : (settings.pickup?.address?.trim() ?? "");

  return {
    ...settings,
    phone: normalizeBusinessPhone(settings.phone),
    pickup: {
      ...settings.pickup,
      address: pickupAddress,
    },
  };
}

export function getLegacySiteSettingsPatches(settings: {
  phone?: string;
  pickup?: { address?: string };
}): Record<string, string> {
  const patches: Record<string, string> = {};
  const normalizedPhone = normalizeBusinessPhone(settings.phone);
  if (settings.phone && normalizedPhone !== settings.phone.trim()) {
    patches.phone = normalizedPhone;
  }
  if (settings.pickup?.address && isPlaceholderPickupAddress(settings.pickup.address)) {
    patches["pickup.address"] = "";
  }
  return patches;
}
