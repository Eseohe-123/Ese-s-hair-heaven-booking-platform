"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

// Only renders for Ese's team (role owner/staff). Customers never see it.
export function OwnerDashboardLink() {
  const { data: session, isPending } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (isPending || (role !== "owner" && role !== "staff")) return null;
  return (
    <li>
      <Link href="/admin" className="text-white/50 hover:text-white">
        Ese&apos;s Dashboard →
      </Link>
    </li>
  );
}
