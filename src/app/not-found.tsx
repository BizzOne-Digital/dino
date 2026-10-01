import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
      <Image src="/images/logo.jpg" alt="Dino's" width={80} height={80} className="rounded-full mb-6" />
      <h1 className="font-display text-4xl font-bold text-forest mb-2">404</h1>
      <p className="text-charcoal/60 mb-8 max-w-md">
        This page got eaten by the dino. Let&apos;s get you back to something fresh.
      </p>
      <Link
        href="/"
        className="rounded-full bg-forest px-8 py-3 font-semibold text-cream hover:bg-dino transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
