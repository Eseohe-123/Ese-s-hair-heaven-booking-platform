import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { StyleCard } from "@/components/StyleCard";
import { RecentRow } from "@/components/RecentlyViewed";
import { getCategories, getHairstyles, staticFallback } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Explore Hairstyles",
  description:
    "Browse braids, wigs, natural hair and locs. Search, filter and request the style you love.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const cat = params.cat ?? "";

  const [results, cats] = await Promise.all([
    getHairstyles({ q, cat }).catch(() => staticFallback({ q, cat })),
    getCategories().catch(() => []),
  ]);
  const categories = cats.length > 0 ? cats.map((c) => c.name) : [...new Set(results.map((r) => r.category))];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        kicker="CATALOGUE"
        title="Explore hairstyles"
        sub="Search, filter by category, then request the style — or describe your own."
      />
      <form method="get" className="mx-auto mb-4 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name — try 'braids'"
          className="flex-1 rounded-full border-2 border-blush-100 bg-white px-5 py-3 text-sm outline-none placeholder:text-cocoa-500 focus:border-blush-500"
        />
        <button type="submit" className="rounded-full bg-plum-700 px-6 py-3 text-sm font-extrabold text-white hover:bg-plum-900">
          Search
        </button>
      </form>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <a
          href="/explore"
          className={`rounded-full px-4 py-2 text-sm font-bold ${!cat ? "bg-plum-700 text-white" : "border-2 border-blush-100 bg-white text-cocoa-700"}`}
        >
          All
        </a>
        {categories.map((c) => (
          <a
            key={c}
            href={`/explore?cat=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-4 py-2 text-sm font-bold ${cat === c ? "bg-plum-700 text-white" : "border-2 border-blush-100 bg-white text-cocoa-700"}`}
          >
            {c}
          </a>
        ))}
      </div>
      {results.length === 0 ? (
        <p className="text-center text-cocoa-500">
          No styles match — try another search, or{" "}
          <a href="/request" className="font-bold text-blush-600 underline">
            tell Ese what you want
          </a>
          .
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((style) => (
            <StyleCard key={style.slug} style={style} />
          ))}
        </div>
      )}
      <div className="mt-8">
        <RecentRow />
      </div>
    </div>
  );
}
