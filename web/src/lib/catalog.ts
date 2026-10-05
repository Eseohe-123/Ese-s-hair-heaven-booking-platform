import { prisma } from "./prisma";
import { HAIRSTYLES, type Hairstyle as UIStyle } from "@/data/content";

type DbStyle = {
  slug: string;
  name: string;
  startingPriceKobo: number;
  description: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  badge: string | null;
  gradient: string | null;
  photos: string[];
  featured: boolean;
  category: { name: string };
};

export function toUIStyle(s: DbStyle): UIStyle {
  return {
    slug: s.slug,
    name: s.name,
    category: s.category.name as UIStyle["category"],
    startingPrice: Math.round(s.startingPriceKobo / 100),
    description: s.description,
    tags: s.tags,
    rating: s.rating,
    reviewsCount: s.reviewsCount,
    badge: (s.badge as UIStyle["badge"]) ?? undefined,
    gradient: s.gradient ?? "linear-gradient(135deg,#fbcfe8,#f472a0)",
    photo: s.photos[0],
    featured: s.featured,
  };
}

export async function getHairstyles(filters?: {
  q?: string;
  cat?: string;
  featuredOnly?: boolean;
}): Promise<UIStyle[]> {
  const q = (filters?.q ?? "").trim();
  const rows = await prisma.hairstyle.findMany({
    where: {
      active: true,
      ...(filters?.featuredOnly ? { featured: true } : {}),
      ...(filters?.cat
        ? { category: { name: filters.cat } }
        : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { category: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
  // Fresh DB (no seed yet) → show static catalogue instead of an empty page.
  if (rows.length === 0) return staticFallback(filters);
  return rows.map(toUIStyle);
}

export async function getHairstyle(slug: string): Promise<UIStyle | null> {
  const row = await prisma.hairstyle.findFirst({
    where: { slug, active: true },
    include: { category: { select: { name: true } } },
  });
  return row ? toUIStyle(row) : null;
}

export async function getCategories(): Promise<{ name: string; slug: string }[]> {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getAddons(): Promise<
  { name: string; priceKobo: number; description: string | null }[]
> {
  return prisma.addon.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

// Static fallback so pages still render if the DB is unreachable.
export function staticFallback(filters?: { q?: string; cat?: string; featuredOnly?: boolean }): UIStyle[] {
  const q = (filters?.q ?? "").toLowerCase();
  return HAIRSTYLES.filter((s) => {
    if (filters?.featuredOnly && !s.featured) return false;
    if (filters?.cat && s.category !== filters.cat) return false;
    if (q && !(s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))) return false;
    return true;
  });
}
