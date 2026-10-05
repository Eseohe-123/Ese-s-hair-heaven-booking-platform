import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { Stars } from "@/components/Stars";
import { StyleCard } from "@/components/StyleCard";
import { FAQS, REVIEWS, WHATSAPP_LINK } from "@/data/content";
import { getHairstyles, staticFallback } from "@/lib/catalog";

const STEPS = [
  {
    title: "Pick or describe",
    body: "Explore hairstyles or tell Ese what you want — photos, combos, your own words.",
  },
  {
    title: "Free consultation",
    body: "Chat on WhatsApp or in person. No waiting, no extra steps.",
  },
  {
    title: "Agree price & time",
    body: "Final price and appointment are agreed together — before anything is paid.",
  },
  {
    title: "Deposit secures it",
    body: "A 50% deposit locks your slot. Reminders and prep notes follow.",
  },
];

export default async function Home() {
  const featured = await getHairstyles({ featuredOnly: true }).catch(() =>
    staticFallback({ featuredOnly: true }),
  );
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-plum-700 via-plum-600 to-blush-500 text-white">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-14 sm:pt-20">
          <p className="text-xs font-extrabold tracking-[3px] text-blush-100">
            CLASSY • CUTE • UNIQUE
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-6xl">
            Your hair experience, from inspiration to aftercare
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            Not just an appointment — personal guidance, an agreed price before
            you pay, and reminders until you sit in the chair.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/explore">Explore Hairstyles</Button>
            <Button href="/request" variant="secondary">
              Tell Ese What I Want
            </Button>
          </div>
        </div>
        <div className="scallop" style={{ ["--scallop-fill" as string]: "#fff7f0" }} />
      </section>

      {/* Trust strip */}
      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-10 sm:grid-cols-3">
        {[
          ["Free consultation", "On WhatsApp or in person — always free."],
          ["Price agreed first", "No deposit until style, price and time are agreed."],
          ["Ese confirms your time", "Suggest a time; Ese confirms or offers an alternative."],
        ].map(([title, body]) => (
          <div
            key={title}
            className="rounded-2xl border border-blush-100 bg-white p-5 shadow-[0_10px_30px_rgba(107,33,72,0.08)]"
          >
            <p className="font-extrabold text-plum-700">{title}</p>
            <p className="mt-1 text-sm text-cocoa-500">{body}</p>
          </div>
        ))}
      </section>

      {/* Featured styles */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <SectionHeading
          kicker="MOST LOVED"
          title="Featured hairstyles"
          sub="Starting prices shown — your final price is agreed in consultation."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((style) => (
            <StyleCard key={style.slug} style={style} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button href="/explore" variant="dark">
            See all hairstyles
          </Button>
        </div>
      </section>

      {/* Promo */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="rounded-[1.5rem] bg-plum-700 p-8 text-center text-white shadow-[0_10px_30px_rgba(107,33,72,0.25)] sm:p-10">
          <p className="text-xs font-extrabold tracking-[3px] text-gold-400">
            LIMITED OFFER
          </p>
          <h2 className="mx-auto mt-2 max-w-xl font-display text-3xl font-semibold">
            New here? Mention NEWHEAVEN for a first-visit treat
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/80">
            Promotions run occasionally — never continuously. Details confirmed
            with Ese during consultation.
          </p>
          <div className="mt-6">
            <Button href="/offers">See offers</Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <SectionHeading kicker="SIMPLE & PERSONAL" title="How booking works" />
        <ol className="grid gap-4 sm:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl border border-blush-100 bg-white p-5"
            >
              <p className="flex h-9 w-9 items-center justify-center rounded-full bg-blush-500 font-display text-lg font-bold text-white">
                {i + 1}
              </p>
              <p className="mt-3 font-extrabold text-plum-700">{step.title}</p>
              <p className="mt-1 text-sm text-cocoa-500">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <SectionHeading
          kicker="CUSTOMER LOVE"
          title="Worn and loved"
          sub="Real reviews — shared with permission."
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {REVIEWS.map((review) => (
            <figure
              key={review.name}
              className="rounded-2xl border border-blush-100 bg-white p-6"
            >
              <Stars value={review.rating} />
              <blockquote className="mt-3 text-cocoa-700">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-4 text-sm font-extrabold text-plum-700">
                {review.name} <span className="font-semibold text-cocoa-500">• {review.style}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Visit Us */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-6 rounded-[1.5rem] border border-blush-100 bg-white p-8 sm:grid-cols-2 sm:p-10">
          <div>
            <SectionHeading
              kicker="VISIT US"
              title="Come get your hair done"
            />
            <ul className="space-y-2 text-cocoa-700">
              <li><strong>Studio address:</strong> coming soon</li>
              <li><strong>Opening days &amp; hours:</strong> coming soon</li>
              <li><strong>What to bring:</strong> shared in your prep notes before the visit</li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-center gap-3 sm:items-end">
            <Button href={WHATSAPP_LINK} variant="dark">
              Contact Ese on WhatsApp
            </Button>
            <Button href="/help" variant="outline">
              Read FAQs &amp; policies
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="mx-auto max-w-3xl px-5 py-8 pb-16">
        <SectionHeading kicker="GOOD TO KNOW" title="Quick answers" />
        <div className="space-y-3">
          {FAQS.slice(0, 3).map((faq) => (
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
        <div className="mt-6 text-center">
          <Button href="/help" variant="outline">
            See all FAQs
          </Button>
        </div>
      </section>
    </>
  );
}
