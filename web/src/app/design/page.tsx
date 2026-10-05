import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { Stars } from "@/components/Stars";
import { StyleCard } from "@/components/StyleCard";
import { HAIRSTYLES } from "@/data/content";

export const metadata: Metadata = {
  title: "Design System",
  description:
    "Hairven living design spec — palette, typography and components. Classy • Cute • Unique.",
  robots: { index: false },
};

const SWATCHES = [
  { name: "Blush Rose", hex: "#F472A0", use: "Primary buttons, highlights", dark: true },
  { name: "Deep Plum", hex: "#6B2148", use: "Headings, contrast", dark: true },
  { name: "Cream", hex: "#FFF7F0", use: "Page background", dark: false, border: true },
  { name: "Gold", hex: "#D4A017", use: "Premium accent, stars", dark: true },
  { name: "Cocoa", hex: "#3E2A2E", use: "Body text", dark: true },
];

export default function DesignPage() {
  const example = HAIRSTYLES[0];
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        kicker="LIVING SPEC • CLASSY • CUTE • UNIQUE"
        title="Hairven design system"
        sub="Palette, type and components. This page is the spec — if it's not here, it's not in the brand."
      />

      {/* 1. Palette */}
      <section className="mt-4">
        <h2 className="font-display text-2xl font-semibold text-plum-700">
          1. Palette
        </h2>
        <p className="mt-1 text-sm text-cocoa-500">
          Warm, cute, distinctive. Text combos are WCAG AA.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SWATCHES.map((s) => (
            <div
              key={s.hex}
              className="overflow-hidden rounded-2xl border border-blush-100 bg-white"
            >
              <div
                className={`h-20 ${s.border ? "border-b border-blush-100" : ""}`}
                style={{ background: s.hex }}
              />
              <div className="p-3 text-[13px]">
                <p className="font-extrabold text-plum-700">{s.name}</p>
                <p className="font-mono text-cocoa-500">{s.hex}</p>
                <p className="mt-1 text-cocoa-500">{s.use}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-plum-700">
          2. Typography
        </h2>
        <p className="mt-1 text-sm text-cocoa-500">
          Fraunces (display, classy) + Nunito Sans (body, friendly).
        </p>
        <div className="mt-4 rounded-2xl border border-blush-100 bg-white p-6">
          <p className="font-display text-3xl font-semibold text-plum-700">
            Knotless Braids, but make it Heaven
          </p>
          <p className="mt-2 text-cocoa-700">
            Body text: consultation is free on WhatsApp. Final price is agreed
            before any deposit — no surprises.
          </p>
        </div>
      </section>

      {/* 3. Components */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-plum-700">
          3. Components
        </h2>
        <p className="mt-1 text-sm text-cocoa-500">
          Real pieces from the booking flow.
        </p>

        <div className="mt-4 rounded-2xl border border-blush-100 bg-white p-6">
          <p className="text-sm font-extrabold text-cocoa-500">BUTTONS</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button href="/explore">Explore Hairstyles</Button>
            <Button href="/request" variant="dark">
              Tell Ese What I Want
            </Button>
            <Button href="/help" variant="outline">
              Consultation (Free)
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-blush-100 bg-white p-6">
          <p className="text-sm font-extrabold text-cocoa-500">
            BADGES + RATINGS
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-extrabold text-[#92400E]">
              BESTSELLER
            </span>
            <span className="rounded-full bg-blush-100 px-2.5 py-1 text-[11px] font-extrabold text-blush-700">
              NEW
            </span>
            <span className="rounded-full bg-[#E0E7FF] px-2.5 py-1 text-[11px] font-extrabold text-[#3730A8]">
              PROMO
            </span>
            <span className="ml-2">
              <Stars value={5} />{" "}
              <span className="text-sm text-cocoa-500">
                4.9 — “My hair has never had so many compliments”
              </span>
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <StyleCard style={example} />
          <div className="rounded-2xl border border-blush-100 bg-white p-6">
            <p className="text-sm font-extrabold text-cocoa-500">
              SLOT PICKER (ESE CONFIRMS)
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {["Fri 10:00", "Fri 13:00", "Sat 09:00", "Sat 12:00 • busy"].map(
                (slot, i) => (
                  <div
                    key={slot}
                    className={`rounded-xl border-2 p-3 text-center text-sm font-bold ${i === 1 ? "border-blush-500 bg-blush-50" : "border-blush-100"} ${i === 3 ? "opacity-45" : ""}`}
                  >
                    {slot}
                  </div>
                ),
              )}
            </div>
            <div className="mt-4 rounded-2xl border-2 border-dashed border-blush-500 bg-blush-50 p-4 text-sm text-cocoa-700">
              Policy tick-box: 50% deposit secures the slot. Customer cancel =
              50% of deposit retained. Reschedule needs 48h notice + fee. Ese
              cancels = 100% refund.
            </div>
            <div className="mt-4 rounded-2xl bg-plum-700 p-4 text-sm text-white">
              <div className="flex justify-between border-b border-white/20 py-1.5">
                <span>Boho Knotless + fullness</span>
                <span>₦45,000</span>
              </div>
              <div className="flex justify-between border-b border-white/20 py-1.5">
                <span>Deposit due now (50%)</span>
                <span>₦22,500</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Balance in studio</span>
                <span>₦22,500</span>
              </div>
            </div>
            <div className="mt-4 max-w-sm rounded-2xl rounded-bl-md border border-blush-100 bg-cream p-3 text-sm">
              <strong className="text-plum-700">Heaven Helper</strong>
              <br />
              Hi! Want help picking a length or checking prices? Tap{" "}
              <strong>Talk to a Person</strong> anytime to reach Ese.
            </div>
          </div>
        </div>
      </section>

      <p className="mt-10 pb-8 text-center text-xs text-cocoa-500">
        Hairven design spec • mobile-first, 16–20px radii, soft shadows • not
        indexed by search
      </p>
    </div>
  );
}
