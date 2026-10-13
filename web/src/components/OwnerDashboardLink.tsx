"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Owner-only shortcut, verified against the server session (not client data).
// Customers never see it. Prominent on purpose — this is Ese's front door.
export function OwnerDashboardLink() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const check = async (tries: number): Promise<void> => {
      try {
        const r = await fetch("/api/me");
        const d = await r.json();
        if (!cancelled && d.signedIn && (d.role === "owner" || d.role === "staff")) setShow(true);
      } catch {
        // Cold starts can be slow — retry a few times before giving up.
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
