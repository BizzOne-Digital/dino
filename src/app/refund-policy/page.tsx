import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { getSiteSettings } from "@/models/SiteSettings";

export default async function RefundPolicyPage() {
  let content = "";
  try {
    await connectDB();
    const settings = await getSiteSettings();
    content = settings.refundPolicy;
  } catch {
    content = "";
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-beige/50 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
          <Link href="/">
            <Image src="/images/logo.jpg" alt="Dino's" width={40} height={40} className="rounded-full" />
          </Link>
          <h1 className="font-display text-xl font-bold text-forest">Refund & Cancellation Policy</h1>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-4 py-10">
        {content ? (
          <div className="prose prose-forest max-w-none whitespace-pre-wrap">{content}</div>
        ) : (
          <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
            <p className="text-charcoal/60 mb-4">Refund policy has not been configured yet.</p>
            <p className="text-sm text-charcoal/40">An administrator can add this from Admin → Settings.</p>
            <Link href="/" className="inline-block mt-6 text-dino hover:underline">← Back to shop</Link>
          </div>
        )}
      </article>
    </div>
  );
}
