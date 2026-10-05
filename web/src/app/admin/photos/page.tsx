import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { StylePhoto } from "@/components/StylePhoto";
import { prisma } from "@/lib/prisma";
import { toUIStyle } from "@/lib/catalog";
import { removeStylePhoto, uploadStylePhoto } from "./actions";

export const metadata: Metadata = {
  title: "Style photos",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const rows = await prisma.hairstyle.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  const styles = rows.map((r) =>
    toUIStyle({
      slug: r.slug,
      name: r.name,
      startingPriceKobo: r.startingPriceKobo,
      description: r.description,
      tags: r.tags,
      rating: r.rating,
      reviewsCount: r.reviewsCount,
      badge: r.badge,
      gradient: r.gradient,
      photos: r.photos,
      featured: r.featured,
      category: { name: r.category.name },
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        kicker="ESE'S SIDE • CONTENT"
        title="Style photos"
        sub="Upload one photo per style — it appears instantly on Explore, detail pages and Gallery. JPG or PNG, under 8MB."
      />
      <p className="mx-auto mb-6 max-w-2xl rounded-2xl bg-blush-50 p-4 text-center text-sm text-cocoa-700">
        Logo: drop a file named <strong>logo.svg</strong> (or logo.png) into the{" "}
        <strong>web/public</strong> folder and the header + footer switch from
        the “H” monogram automatically. No code change needed.
      </p>
      <p className="mb-6 text-center text-sm">
        <Link href="/admin/requests" className="font-bold text-blush-600 underline">
          ← Back to requests inbox
        </Link>
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {styles.map((s) => (
          <div key={s.slug} className="rounded-2xl border border-blush-100 bg-white p-4">
            <StylePhoto photo={s.photo} name={s.name} gradient={s.gradient} className="aspect-square w-full text-2xl" />
            <p className="mt-2 text-sm font-extrabold text-plum-700">{s.name}</p>
            <p className="text-xs text-cocoa-500">{s.photo ? "Photo live" : "Placeholder showing"}</p>
            <form action={uploadStylePhoto} className="mt-2 flex flex-col gap-2">
              <input type="hidden" name="slug" value={s.slug} />
              <input
                name="photo" type="file" accept="image/*" required
                className="w-full text-xs text-cocoa-700 file:mr-2 file:rounded-full file:border-0 file:bg-blush-500 file:px-3 file:py-1.5 file:text-xs file:font-extrabold file:text-white"
              />
              <button type="submit" className="rounded-full bg-plum-700 px-4 py-2 text-xs font-extrabold text-white">
                Upload photo
              </button>
            </form>
            {s.photo && (
              <form action={removeStylePhoto} className="mt-2">
                <input type="hidden" name="slug" value={s.slug} />
                <button type="submit" className="text-xs font-bold text-red-700 underline">
                  Remove photo (back to placeholder)
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
