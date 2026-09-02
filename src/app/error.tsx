"use client";

import Image from "next/image";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
      <Image src="/images/logo.jpg" alt="Dino's" width={80} height={80} className="rounded-full mb-6" />
      <h1 className="font-display text-3xl font-bold text-forest mb-2">Something went wrong</h1>
      <p className="text-charcoal/60 mb-8 max-w-md">
        We hit a snag in the kitchen. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-forest px-8 py-3 font-semibold text-cream hover:bg-dino transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
