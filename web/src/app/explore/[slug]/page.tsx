import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { Stars } from "@/components/Stars";
import { StylePhoto } from "@/components/StylePhoto";
import { TrackView } from "@/components/RecentlyViewed";
import { StyleCard } from "@/components/StyleCard";
import { formatNaira } from "@/data/content";
import { getAddons, getHairstyle, getHairstyles, staticFallback } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const style = await getHairstyle(slug).catch(() => null);
  return { title: style?.name ?? "Hairstyle" };
}

export default async function StyleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const style = await getHairstyle(slug).catch(
    () => staticFallback().find((s) => s.slug === slug) ?? null,
  );
  if (!style) notFound();

  const addons = await getAddons().catch(() => []);
  const similar = (await getHairstyles().catch(() => staticFallback())).filter(
    (s) => s.slug !== style.slug && s.category === style.category,
  ).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <TrackView
        item={{ slug: style.slug, name: style.name, price: style.startingPrice, gradient: style.gradient }}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <StylePhoto
          photo={style.photo}
          name={style.name}
          gradient={style.gradient}
          className="min-h-80 w-full rounded-[1.5rem] text-5xl"
        />
        <div>
          <p className="text-xs font-extrabold tracking-[3px] text-blush-600">
            {style.category.toUpperCase()}
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold text-plum-700">
            {style.name}
          </h1>
          <p className="mt-2">
            <Stars value={style.rating} />{" "}
            <span className="font-bold">{style.rating}</span>{" "}
            <span className="text-sm text-cocoa-500">({style.reviewsCount} reviews)</span>
          </p>
          <p className="mt-4 text-cocoa-700">{style.description}</p>
          <p className="mt-4 text-2xl font-extrabold text-plum-700">
            Starting from {formatNaira(style.startingPrice)}
          </p>
          <p className="mt-1 text-sm text-cocoa-500">
            Final price (length, size, colour, fullness, add-ons, extensions)
            is agreed in free consultation — before any deposit.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {style.tags.map((t) => (
              <span key={t} className="rounded-full border-2 border-blush-100 bg-white px-3 py-1 text-xs font-bold text-cocoa-700">
                {t}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={`/request?style=${style.slug}`}>Request This Style</Button>
            <Button href="/explore" variant="outline">
              Back to explore
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-[1.5rem] border border-blush-100 bg-white p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-plum-700">
          Customisation &amp; add-ons
        </h2>
        <ul className="mt-3 divide-y divide-blush-100 text-sm">
          {addons.map((a) => (
            <li key={a.name} className="flex justify-between gap-4 py-2.5">
              <span>
                <strong className="text-cocoa-900">{a.name}</strong>
                {a.description && <span className="text-cocoa-500"> — {a.description}</span>}
              </span>
              <span className="font-bold text-plum-700">
                {a.priceKobo > 0 ? `From ${formatNaira(Math.round(a.priceKobo / 100))}` : "In consultation"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {similar.length > 0 && (
        <div className="mt-10">
          <SectionHeading title="You may also love" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <StyleCard key={s.slug} style={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
