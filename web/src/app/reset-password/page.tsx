"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { SectionHeading } from "@/components/SectionHeading";
import { PasswordField } from "@/components/PasswordField";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const linkError = params.get("error");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Those two passwords don't match. Type them again.");
      return;
    }
    setBusy(true);
    try {
      const res = await authClient.resetPassword({ newPassword: password, token });
      if (res.error) throw new Error(res.error.message);
      router.push("/login?reset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (!token || linkError) {
    return (
      <div className="mx-auto max-w-md px-5 py-10 text-center">
        <SectionHeading kicker="PASSWORD HELP" title="This link has expired" />
        <p className="text-cocoa-500">
          Reset links last one hour. Request a fresh one and it will work.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block rounded-full bg-blush-500 px-6 py-3 text-sm font-extrabold text-white hover:bg-blush-600"
        >
          Send a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-10">
      <SectionHeading
        kicker="PASSWORD HELP"
        title="Choose a new password"
        sub="Use at least 8 characters. You'll sign in with it on your phone and laptop."
      />
      <form onSubmit={submit} className="rounded-[1.5rem] border border-blush-100 bg-white p-6">
        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          autoComplete="new-password"
          placeholder="New password (8+ characters)"
        />
        <PasswordField
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={8}
          autoComplete="new-password"
          placeholder="Type it again"
          className="mt-3"
        />
        {error && (
          <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-full bg-blush-500 px-6 py-3 text-sm font-extrabold text-white hover:bg-blush-600 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}
