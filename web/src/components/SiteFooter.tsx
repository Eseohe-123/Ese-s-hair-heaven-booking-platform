import Link from "next/link";
import { WHATSAPP_LINK } from "@/data/content";
import { LogoMark } from "./LogoMark";

export function SiteFooter() {
  return (
    <footer className="bg-plum-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-display text-2xl font-semibold">
            <LogoMark className="h-8 w-8" />
            Hairven
          </p>
          <p className="mt-1 text-xs font-extrabold tracking-[3px] text-blush-200">
            CLASSY • CUTE • UNIQUE
          </p>
          <p className="mt-4 max-w-xs text-sm text-white/80">
            The full hair experience — inspiration, consultation, appointment and
            aftercare. Warm, modern and premium but affordable.
          </p>
        </div>
        <div>
          <p className="font-extrabold">Visit Us</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>Studio address — coming soon</li>
            <li>Opening days &amp; hours — coming soon</li>
            <li>
              <a href={WHATSAPP_LINK} className="underline hover:text-white">
                Chat with Ese on WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-extrabold">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/explore" className="hover:text-white">Explore Hairstyles</Link></li>
            <li><Link href="/request" className="hover:text-white">Tell Ese What I Want</Link></li>
            <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link href="/help" className="hover:text-white">Help &amp; Policies</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-white/60">
          © {new Date().getFullYear()} Hairven. Prices shown are
          starting prices — your final price is always agreed before any deposit.
        </p>
      </div>
    </footer>
  );
}
