import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { HAIRSTYLES } from "@/data/content";
import { getHairstyles, staticFallback } from "@/lib/catalog";
import { createRequest } from "./actions";

export const metadata: Metadata = {
  title: "Tell Ese What I Want",
  description:
    "Request any hairstyle with inspiration photos and your own words, then consult free on WhatsApp.",
};

const inputCls =
  "w-full rounded-2xl border-2 border-blush-100 bg-white px-4 py-3 text-sm outline-none placeholder:text-cocoa-500 focus:border-blush-500";

export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<{ style?: string }>;
}) {
  const params = await searchParams;
  const styles = await getHairstyles().catch(() => staticFallback());
  const preselected =
    styles.find((s) => s.slug === params.style) ??
    HAIRSTYLES.find((s) => s.slug === params.style);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading
        kicker="CUSTOM REQUEST"
        title="Tell Ese what you want"
        sub="Send inspiration, details and your preferred time. Free consultation follows on WhatsApp — nothing is paid yet."
      />
      <form
        action={createRequest}
        className="rounded-[1.5rem] border border-blush-100 bg-white p-6 sm:p-8"
      >
        <label className="block text-sm font-extrabold text-plum-700">
          Start from a hairstyle (optional)
          <select name="hairstyleSlug" defaultValue={preselected?.slug ?? ""} className={`${inputCls} mt-2`}>
            <option value="">I&apos;ll describe my own / a combo</option>
            {styles.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name} — from ₦{s.startingPrice.toLocaleString("en-NG")}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-extrabold text-plum-700">
            Style name (if custom)
            <input name="customName" placeholder="e.g. Boho with blonde tips" className={`${inputCls} mt-2`} />
          </label>
          <label className="block text-sm font-extrabold text-plum-700">
            Your phone or email
            <input name="contact" required placeholder="So Ese can reach you" className={`${inputCls} mt-2`} />
          </label>
        </div>

        <label className="mt-4 block text-sm font-extrabold text-plum-700">
          Describe what you want *
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Length, size, colour, vibe — your own words are perfect."
            className={`${inputCls} mt-2`}
          />
        </label>

        <label className="mt-4 block text-sm font-extrabold text-plum-700">
          Combining photos? Explain the combo
          <input
            name="comboNotes"
            placeholder="e.g. colour from photo 1, length from photo 2"
            className={`${inputCls} mt-2`}
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-extrabold text-plum-700">
            Your hair details
            <input name="hairDetails" placeholder="e.g. natural, shoulder length" className={`${inputCls} mt-2`} />
          </label>
          <label className="block text-sm font-extrabold text-plum-700">
            Preferred date &amp; time
            <input name="preferredDate" type="datetime-local" className={`${inputCls} mt-2`} />
          </label>
        </div>

        <label className="mt-4 block text-sm font-extrabold text-plum-700">
          Special requests
          <input name="specialRequests" placeholder="Allergies, accessories, extensions..." className={`${inputCls} mt-2`} />
        </label>

        <label className="mt-4 block text-sm font-extrabold text-plum-700">
          Inspiration photos (up to 4)
          <input
            name="photos"
            type="file"
            accept="image/*"
            multiple
            className="mt-2 w-full text-sm text-cocoa-700 file:mr-3 file:rounded-full file:border-0 file:bg-blush-500 file:px-4 file:py-2 file:text-sm file:font-extrabold file:text-white"
          />
        </label>

        <fieldset className="mt-4">
          <legend className="text-sm font-extrabold text-plum-700">Consultation</legend>
          <div className="mt-2 flex gap-4 text-sm font-bold text-cocoa-700">
            <label className="flex items-center gap-2">
              <input type="radio" name="channel" value="whatsapp_online" defaultChecked className="accent-[#e05286]" />
              WhatsApp (online)
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="channel" value="physical" className="accent-[#e05286]" />
              Physical
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-blush-500 px-6 py-3.5 text-[15px] font-extrabold text-white shadow-[0_8px_20px_rgba(244,114,160,0.45)] hover:bg-blush-600"
        >
          Send my request — free consultation next
        </button>
        <p className="mt-3 text-center text-xs text-cocoa-500">
          No payment now. Final price and time are agreed with Ese first.
        </p>
      </form>
    </div>
  );
}
