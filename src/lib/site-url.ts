/** Production storefront — used for Stripe return URLs when env is unset. */
export const CANONICAL_SITE_URL = "https://dinoscookiesandbagels.ca";

function normalizeOrigin(url: string): string {
  return url.replace(/\/$/, "");
}

function isAllowedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "dinoscookiesandbagels.ca" ||
    host === "www.dinoscookiesandbagels.ca" ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

function originFromRequest(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const parsed = new URL(origin);
      if (isAllowedHostname(parsed.hostname)) {
        return normalizeOrigin(parsed.origin);
      }
    } catch {
      /* ignore */
    }
  }

  const rawHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!rawHost) return null;

  const host = rawHost.split(",")[0]?.trim();
  if (!host) return null;

  const hostname = host.replace(/:\d+$/, "").toLowerCase();
  if (!isAllowedHostname(hostname)) return null;

  const proto =
    hostname === "localhost" || hostname === "127.0.0.1"
      ? request.headers.get("x-forwarded-proto") || "http"
      : "https";

  return normalizeOrigin(`${proto}://${host}`);
}

/**
 * Canonical site origin for Stripe redirect URLs and emails (no trailing slash).
 * Priority: NEXT_PUBLIC_SITE_URL → request host (allowed domains) → production canonical → Vercel preview → localhost.
 */
export function getSiteUrl(request?: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return normalizeOrigin(configured);

  if (request) {
    const fromRequest = originFromRequest(request);
    if (fromRequest) return fromRequest;
  }

  if (process.env.VERCEL_ENV === "production") {
    return CANONICAL_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return normalizeOrigin(`https://${process.env.VERCEL_URL}`);
  }

  return "http://localhost:3000";
}
