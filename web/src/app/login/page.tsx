"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { SectionHeading } from "@/components/SectionHeading";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({ name, email, password });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message);
      }
      router.push("/account");
      router.refresh();
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
        kicker="MEMBERS"
        title={mode === "up" ? "Create your account" : "Welcome back"}
        sub="Accounts are optional — members get loyalty points, faster booking and member-only treats."
      />
      <form onSubmit={submit} className="rounded-[1.5rem] border border-blush-100 bg-white p-6">
        <div className="mb-4 flex rounded-full bg-blush-50 p-1 text-sm font-extrabold">
          {(["up", "in"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-full py-2 ${mode === m ? "bg-white text-plum-700 shadow" : "text-cocoa-500"}`}
            >
              {m === "up" ? "Sign up" : "Sign in"}
            </button>
          ))}
        </div>
        {mode === "up" && (
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className={inputCls} />
        )}
        <input
          value={email} onChange={(e) => setEmail(e.target.value)} required type="email"
          placeholder="Email" className={`${inputCls} mt-3`}
        />
        <input
          value={password} onChange={(e) => setPassword(e.target.value)} required
          type="password" minLength={8} placeholder="Password (8+ characters)" className={`${inputCls} mt-3`}
        />
        {error && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        <button
          type="submit" disabled={busy}
          className="mt-4 w-full rounded-full bg-blush-500 px-6 py-3 text-sm font-extrabold text-white hover:bg-blush-600 disabled:opacity-60"
        >
          {busy ? "Please wait..." : mode === "up" ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
