import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { FAQS, WHATSAPP_LINK } from "@/data/content";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Help & Policies",
  description:
    "FAQs, deposits, cancellation and rescheduling policy, and how to reach Ese.",
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading
        kicker="HELP & CUSTOMER SUPPORT"
        title="How can we help?"
        sub="Instant answers below — or talk to a real person any time."
      />
      <div className="space-y-3">
        {FAQS.map((faq) => (
          <details
            key={faq.q}
            className="rounded-2xl border border-blush-100 bg-white p-5"
          >
            <summary className="cursor-pointer font-extrabold text-plum-700">
              {faq.q}
            </summary>
            <p className="mt-2 text-sm text-cocoa-700">{faq.a}</p>
          </details>
        ))}
      </div>

      <div
        id="bookings"
        className="mt-10 rounded-[1.5rem] bg-plum-700 p-8 text-white"
      >
        <h2 className="font-display text-2xl font-semibold">My Bookings</h2>
        <p className="mt-2 text-sm text-white/80">
          Guest booking lookup (phone/email code) arrives in Phase 5. For now,
          forward your confirmation message on WhatsApp and Ese will pull up
          your appointment.
        </p>
        <div className="mt-5">
          <Button href={WHATSAPP_LINK}>Talk to a Person on WhatsApp</Button>
        </div>
      </div>

      <div className="mt-10 rounded-[1.5rem] border border-blush-100 bg-white p-8">
        <h2 className="font-display text-2xl font-semibold text-plum-700">
          Cancellation &amp; rescheduling, in short
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-cocoa-700">
          <li>You cancel: 50% of your deposit is refunded.</li>
          <li>You reschedule or miss: a small fee applies, 48h notice please.</li>
          <li>Ese cancels: 100% refund. Ese reschedules: no penalty to you.</li>
        </ul>
        <p className="mt-3 text-xs text-cocoa-500">
          Full Terms, Refund and Privacy documents are finalised before launch.
        </p>
      </div>
    </div>
  );
}
