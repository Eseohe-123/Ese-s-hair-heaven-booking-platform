"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Owner-only shortcut, verified against the server session (not client data).
// Customers never see it. Prominent on purpose — this is Ese's front door.
export function OwnerDashboardLink() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.signedIn && (d.role === "owner" || d.role === "staff")) setShow(true);
      })
      .catch(() => {
        // offline or logged out — stay hidden
      });
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
