import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { StylePhoto } from "@/components/StylePhoto";
import { getCategories, getHairstyles, staticFallback } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Hairven professional work — braids, wigs, natural hair, locs and studio shots.",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const params = await searchParams;
  const cat = params.cat ?? "";
  const [items, cats] = await Promise.all([
    getHairstyles({ cat }).catch(() => staticFallback({ cat })),
    getCategories().catch(() => []),
  ]);
  const categories = cats.length > 0 ? cats.map((c) => c.name) : [...new Set(items.map((r) => r.category))];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        kicker="PROFESSIONAL WORK"
        title="Gallery"
        sub="Finished styles, lengths, colours and before-and-after looks. Real photos replace these placeholders at launch."
      />
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <a
          href="/gallery"
          className={`rounded-full px-4 py-2 text-sm font-bold ${!cat ? "bg-plum-700 text-white" : "border-2 border-blush-100 bg-white text-cocoa-700"}`}
        >
          All work
        </a>
        {categories.map((c) => (
          <a
            key={c}
            href={`/gallery?cat=${encodeURIComponent(c)}`}
            className={`rounded-full px-4 py-2 text-sm font-bold ${cat === c ? "bg-plum-700 text-white" : "border-2 border-blush-100 bg-white text-cocoa-700"}`}
          >
            {c}
          </a>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <a key={item.slug} href={`/explore/${item.slug}`}>
            <figure className="overflow-hidden rounded-2xl border border-blush-100 bg-white transition-shadow hover:shadow-[0_10px_30px_rgba(107,33,72,0.18)]">
              <StylePhoto
                photo={item.photo}
                name={item.name}
                gradient={item.gradient}
                className="aspect-square w-full text-3xl"
              />
              <figcaption className="p-3">
                <p className="text-sm font-extrabold text-plum-700">{item.name}</p>
                <p className="text-xs text-cocoa-500">{item.category}</p>
              </figcaption>
            </figure>
          </a>
        ))}
      </div>
    </div>
  );
}
