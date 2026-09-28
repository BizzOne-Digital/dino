import Link from "next/link";
import Image from "next/image";
import { XCircle } from "lucide-react";

export default async function CheckoutCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center rounded-3xl bg-white p-10 shadow-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-caramel/10">
          <XCircle size={48} className="text-caramel" />
        </div>
        <h1 className="font-display text-2xl font-bold text-forest mb-2">Payment Cancelled</h1>
        <p className="text-charcoal/60 mb-2">
          Your payment was not completed. No charges were made.
        </p>
        {order && (
          <p className="text-sm text-charcoal/40 mb-6">Order reference: {order}</p>
        )}
        <div className="flex flex-col gap-3">
          <Link
            href="/checkout"
            className="rounded-full bg-forest px-8 py-3 font-semibold text-cream hover:bg-dino transition-colors"
          >
            Try Again
          </Link>
          <Link href="/" className="text-sm text-charcoal/50 hover:text-forest">
            Return to shop
          </Link>
        </div>
        <Image src="/images/logo.jpg" alt="" width={50} height={50} className="mx-auto mt-8 rounded-full opacity-50" />
      </div>
    </div>
  );
}
