"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { SectionHeading } from "@/components/SectionHeading";
import { WHATSAPP_LINK } from "@/data/content";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (res.error) throw new Error(res.error.message);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-2xl border-2 border-blush-100 bg-white px-4 py-3 text-sm outline-none placeholder:text-cocoa-500 focus:border-blush-500";

  return (
    <div className="mx-auto max-w-md px-5 py-10">
      <SectionHeading
        kicker="PASSWORD HELP"
        title="Reset your password"
        sub="We'll email you a link to choose a new one. Your bookings and points stay exactly as they are."
      />

      {sent ? (
        <div className="rounded-[1.5rem] border border-blush-100 bg-white p-6 text-center">
          <p className="text-sm font-extrabold text-plum-700">Check your inbox</p>
          <p className="mt-2 text-sm text-cocoa-500">
            If <strong className="text-cocoa-700">{email}</strong> has a Hairven
            account, the reset link is on its way. It expires in one hour.
          </p>
          <p className="mt-4 text-xs text-cocoa-500">
            No email after a few minutes? Check spam, then{" "}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="font-extrabold text-blush-600 hover:underline"
            >
              message Ese on WhatsApp
            </a>{" "}
            and she&apos;ll reset it for you.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-full border-2 border-blush-100 px-6 py-3 text-sm font-extrabold text-plum-700 hover:border-blush-500"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="rounded-[1.5rem] border border-blush-100 bg-white p-6"
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            autoComplete="email"
            placeholder="Email you signed up with"
            className={inputCls}
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
            {busy ? "Sending…" : "Send reset link"}
          </button>
          <p className="mt-4 text-center text-sm text-cocoa-500">
            Remembered it?{" "}
            <Link href="/login" className="font-extrabold text-blush-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-cocoa-500">
        No email arriving? Message{" "}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          className="font-extrabold text-blush-600 hover:underline"
        >
          Ese on WhatsApp
        </a>{" "}
        — she can reset it for you.
      </p>
    </div>
  );
}
