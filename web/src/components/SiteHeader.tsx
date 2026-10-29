import Link from "next/link";
import { LogoMark } from "./LogoMark";
import { MobileMenu } from "./MobileMenu";
import { getSessionUser } from "@/lib/session";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/gallery", label: "Gallery" },
  { href: "/customer-looks", label: "Customer Looks" },
  { href: "/offers", label: "Offers" },
  { href: "/help", label: "Help" },
];

export async function SiteHeader() {
  const user = await getSessionUser();
  const role = (user as { role?: string } | null)?.role;
  const isOwner = role === "owner" || role === "staff";

  return (
    <header className="sticky top-0 z-50 border-b border-blush-100 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark className="h-11 w-auto" />
          <span className="leading-tight">
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
          {isOwner && (
            <Link
              href="/admin"
              className="rounded-full bg-blush-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-blush-600"
            >
              Dashboard
            </Link>
          )}
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
        <MobileMenu
          owner={isOwner}
          items={[
            ...NAV,
            { href: "/track", label: "My Bookings" },
            { href: "/account", label: "Account" },
          ]}
        />
      </div>
    </header>
  );
}
