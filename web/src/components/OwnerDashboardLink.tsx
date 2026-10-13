"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Owner-only shortcut. Reads the role straight from Better Auth's own
// session endpoint (which includes custom profile fields like role).
// Customers and logged-out visitors never see it.
export function OwnerDashboardLink() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const check = async (tries: number): Promise<void> => {
      try {
        const r = await fetch("/api/auth/get-session");
        const d = await r.json();
        const role = d?.user?.role;
        if (!cancelled && (role === "owner" || role === "staff")) setShow(true);
      } catch {
        // Slow cold starts happen — retry a few times before giving up.
        if (!cancelled && tries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          await check(tries - 1);
        }
      }
    };
    check(3);
    return () => {
      cancelled = true;
    };
  }, []);
  if (!show) return null;
  return (
    <li>
      <Link
        href="/admin"
        className="mt-1 inline-block rounded-full bg-blush-500 px-4 py-1.5 text-sm font-extrabold text-white"
      >
        Open Dashboard →
      </Link>
    </li>
  );
}
