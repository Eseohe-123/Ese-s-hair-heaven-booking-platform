"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
      className="rounded-full border-2 border-blush-100 px-6 py-2.5 text-sm font-extrabold text-plum-700 hover:border-blush-500"
    >
      Sign out
    </button>
  );
}
