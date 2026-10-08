"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Floating shortcut back to the main menu. Hidden on the homepage itself.
export function FloatingHome() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <Link
      href="/"
      aria-label="Back to main menu"
      className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-1.5 rounded-full bg-plum-700 px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(107,33,72,0.45)] hover:bg-plum-900"
    >
      <span aria-hidden>⌂</span> Home
    </Link>
  );
}
