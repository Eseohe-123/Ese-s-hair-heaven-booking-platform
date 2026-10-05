import Link from "next/link";
import { LogoMark } from "./LogoMark";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/gallery", label: "Gallery" },
  { href: "/customer-looks", label: "Customer Looks" },
  { href: "/offers", label: "Offers" },
  { href: "/help", label: "Help" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-blush-100 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold text-plum-700">
              Hairven
            </span>
            <span className="block text-[10px] font-extrabold tracking-[2px] text-blush-600">
              CLASSY • CUTE • UNIQUE
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-bold text-cocoa-700 lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-blush-600">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/track"
            className="rounded-full px-4 py-2 text-sm font-extrabold text-plum-700 hover:bg-blush-50"
          >
            My Bookings
          </Link>
          <Link
            href="/account"
            className="rounded-full px-4 py-2 text-sm font-extrabold text-plum-700 hover:bg-blush-50"
          >
            Account
          </Link>
          <Link
            href="/request"
            className="rounded-full bg-blush-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(244,114,160,0.45)] hover:bg-blush-600"
          >
            Tell Ese What I Want
          </Link>
        </div>
        <details className="lg:hidden">
          <summary className="cursor-pointer list-none rounded-full border-2 border-blush-100 px-4 py-2 text-sm font-extrabold text-plum-700">
            Menu
          </summary>
          <nav className="absolute right-4 mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-blush-100 bg-white p-3 shadow-xl">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-bold text-cocoa-700 hover:bg-blush-50"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/request"
              className="mt-1 rounded-xl bg-blush-500 px-3 py-2 text-center text-sm font-extrabold text-white"
            >
              Tell Ese What I Want
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
