import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = { title: "Track my request" };

export default function TrackPage() {
  async function lookup(formData: FormData) {
    "use server";
    const code = ((formData.get("code") as string) || "").trim().toUpperCase();
    redirect(`/track/${encodeURIComponent(code)}`);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <SectionHeading
        kicker="MY BOOKINGS"
        title="Track my request"
        sub="Enter the code from your request (e.g. EHH-7K2P9Q)."
      />
      <form
        action={lookup}
        className="flex flex-col gap-3 rounded-[1.5rem] border border-blush-100 bg-white p-6"
      >
        <input
          name="code"
          required
          placeholder="EHH-XXXXXX"
          className="w-full rounded-full border-2 border-blush-100 bg-white px-5 py-3 text-center text-lg font-extrabold tracking-widest uppercase outline-none placeholder:text-cocoa-500 focus:border-blush-500"
        />
        <button
          type="submit"
          className="rounded-full bg-plum-700 px-6 py-3 text-sm font-extrabold text-white hover:bg-plum-900"
        >
          Look up
        </button>
      </form>
    </div>
  );
}
