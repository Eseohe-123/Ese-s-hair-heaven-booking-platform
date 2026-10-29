"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WHATSAPP_LINK } from "@/data/content";

// Shown when a page fails to render. Most failures here are a slow database
// wake-up, so the copy points at "try again" first and support second.
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-5 py-16 text-center">
      <p className="mb-2 text-xs font-extrabold tracking-[3px] text-blush-600">OOPS</p>
      <h1 className="font-display text-3xl font-semibold text-plum-700 sm:text-4xl">
        That page didn&apos;t load
      </h1>
      <p className="mt-3 text-cocoa-500">
        Usually this is just a slow connection or the studio server waking up. Give it
        another go — nothing you sent has been lost.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-blush-500 px-6 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(244,114,160,0.45)] hover:bg-blush-600"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border-2 border-blush-100 px-6 py-3 text-sm font-extrabold text-plum-700 hover:border-blush-500"
        >
          Reload page
        </button>
      </div>

      <p className="mt-6 text-sm text-cocoa-500">
        Still stuck?{" "}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          className="font-extrabold text-blush-600 hover:underline"
        >
          Message Ese on WhatsApp
        </a>{" "}
        or{" "}
        <Link href="/" className="font-extrabold text-blush-600 hover:underline">
          go back home
        </Link>
        .
      </p>

      {error.digest && (
        <p className="mt-6 text-xs text-cocoa-500">Reference: {error.digest}</p>
      )}
    </div>
  );
}
