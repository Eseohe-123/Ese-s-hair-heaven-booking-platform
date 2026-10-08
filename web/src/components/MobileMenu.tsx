"use client";

import Link from "next/link";
import { useState } from "react";

// Mobile menu that closes itself when a destination is tapped.
export function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="cursor-pointer rounded-full border-2 border-blush-100 px-4 py-2 text-sm font-extrabold text-plum-700"
      >
        Menu
      </button>
      {open && (
        <nav className="absolute right-4 mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-blush-100 bg-white p-3 shadow-xl">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-bold text-cocoa-700 hover:bg-blush-50"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/request"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-xl bg-blush-500 px-3 py-2 text-center text-sm font-extrabold text-white"
          >
            Tell Ese What I Want
          </Link>
        </nav>
      )}
    </div>
  );
}
