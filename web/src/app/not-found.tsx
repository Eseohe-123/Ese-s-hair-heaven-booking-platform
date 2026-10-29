import Link from "next/link";
import { StylePhoto } from "@/components/StylePhoto";
import { WHATSAPP_LINK } from "@/data/content";

// Branded 404. Most misses here are an expired booking code, so the copy
// leans on "check your code" and gives a way out.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-16 text-center">
      <div className="mx-auto mb-6 h-40 w-40">
        <Link href="/" aria-label="Back to Hairven home">
          <StylePhoto
            photo="/logo.png"
            name="Hairven"
            gradient="linear-gradient(135deg,#f472a0,#6b2148)"
            className="h-40 w-40 rounded-full border-4 border-blush-100 bg-white p-4"
          />
        </Link>
      </div>
      <p className="mb-2 text-xs font-extrabold tracking-[3px] text-blush-600">
        404
      </p>
      <h1 className="font-display text-3xl font-semibold text-plum-700 sm:text-4xl">
        This page isn&apos;t here
      </h1>
      <p className="mt-3 text-cocoa-500">
        The link may be old, or the booking code might be typed differently. Try
        pasting the full code from your confirmation message (it starts with
        <strong className="text-cocoa-700"> EHH-</strong>).
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/explore"
          className="rounded-full bg-blush-500 px-6 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(244,114,160,0.45)] hover:bg-blush-600"
        >
          Browse hairstyles
        </Link>
        <Link
          href="/track"
          className="rounded-full border-2 border-blush-100 px-6 py-3 text-sm font-extrabold text-plum-700 hover:border-blush-500"
        >
          Find my booking
        </Link>
      </div>

      <p className="mt-6 text-sm text-cocoa-500">
        Need a hand?{" "}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          className="font-extrabold text-blush-600 hover:underline"
        >
          Message Ese on WhatsApp
        </a>
        .
      </p>
    </div>
  );
}
