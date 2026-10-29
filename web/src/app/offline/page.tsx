import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

export const metadata = { title: "You're offline" };

// Pre-cached by the service worker so a dropped connection never shows a
// browser error page inside the installed app.
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <div className="mb-6 flex justify-center">
        <LogoMark className="h-14 w-auto" />
      </div>
      <p className="mb-2 text-xs font-extrabold tracking-[3px] text-blush-600">
        NO CONNECTION
      </p>
      <h1 className="font-display text-3xl font-semibold text-plum-700">
        You&apos;re offline
      </h1>
      <p className="mt-3 text-cocoa-500">
        Hairven needs a connection to load styles and bookings. Check your data or
        Wi-Fi, then try again — nothing you sent has been lost.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-blush-500 px-6 py-3 text-sm font-extrabold text-white hover:bg-blush-600"
      >
        Try again
      </Link>
    </div>
  );
}
