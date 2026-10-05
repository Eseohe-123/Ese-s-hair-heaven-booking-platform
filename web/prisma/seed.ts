import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const CATEGORIES = [
  { name: "Braids", slug: "braids" },
  { name: "Wig & Frontal", slug: "wig-frontal" },
  { name: "Natural Hair", slug: "natural-hair" },
  { name: "Locs", slug: "locs" },
];

const ADDONS = [
  { name: "Extra length", priceKobo: 0, description: "Priced in consultation" },
  { name: "Extra fullness", priceKobo: 0, description: "Priced in consultation" },
  { name: "Colour", priceKobo: 0, description: "Priced in consultation" },
  { name: "Curls", priceKobo: 500000, description: "From ₦5,000" },
  { name: "Hair accessories", priceKobo: 200000, description: "From ₦2,000" },
  { name: "Wash & treatment", priceKobo: 500000, description: "From ₦5,000" },
];

const STYLES = [
  { slug: "boho-knotless-braids", name: "Boho Knotless Braids", cat: "Braids", price: 3500000, description: "Lightweight knotless braids with soft curly ends. Length, size and colour agreed in consultation.", tags: ["Long", "Medium", "Coloured", "+ Curls"], rating: 4.9, reviewsCount: 42, badge: "BESTSELLER", gradient: "linear-gradient(135deg,#fbcfe8,#f472a0)", featured: true },
  { slug: "french-curls-braids", name: "French Curls Braids", cat: "Braids", price: 3000000, description: "Bouncy French-curl ends on neat braids. Extra fullness available as an add-on.", tags: ["Medium", "Long", "Extra fullness"], rating: 4.8, reviewsCount: 31, gradient: "linear-gradient(135deg,#f3dce7,#9a2b5e)", featured: true },
  { slug: "frontal-wig-install", name: "Frontal Wig Install", cat: "Wig & Frontal", price: 2500000, description: "Melted frontal install with styling of your choice. Bring your wig or source it through Ese.", tags: ["Straight", "Curly", "Styling included"], rating: 4.9, reviewsCount: 27, badge: "NEW", gradient: "linear-gradient(135deg,#e3b93a,#9a2b5e)", featured: true },
  { slug: "silk-press-natural", name: "Silk Press (Natural Hair)", cat: "Natural Hair", price: 1500000, description: "Gentle wash, treatment and silky press for natural hair. Wash & treatment add-on available.", tags: ["Shoulder length", "Long", "+ Treatment"], rating: 4.7, reviewsCount: 19, gradient: "linear-gradient(135deg,#fce7f3,#d4a017)", featured: true },
  { slug: "goddess-locs", name: "Goddess Locs", cat: "Locs", price: 3200000, description: "Soft, textured locs with curly accents. Size and length customised to you.", tags: ["Medium", "Long", "Curly accents"], rating: 4.8, reviewsCount: 22, gradient: "linear-gradient(135deg,#9a2b5e,#471532)", featured: false },
  { slug: "stitch-cornrows", name: "Stitch Cornrows", cat: "Braids", price: 1200000, description: "Clean, precise stitch cornrows in the pattern you love. Accessories on request.", tags: ["Pattern of choice", "+ Accessories"], rating: 4.9, reviewsCount: 35, badge: "PROMO", gradient: "linear-gradient(135deg,#f472a0,#6b2148)", featured: false },
  { slug: "closure-sew-in", name: "Closure Sew-In", cat: "Wig & Frontal", price: 2800000, description: "Flat, natural-looking closure sew-in. Bundles supplied by you or by Ese.", tags: ["Straight", "Body wave"], rating: 4.7, reviewsCount: 16, gradient: "linear-gradient(135deg,#fbeedf,#e05286)", featured: false },
  { slug: "wash-and-twist-out", name: "Wash, Treat & Twist-Out", cat: "Natural Hair", price: 1000000, description: "Nourishing wash, deep treatment and defined twist-out for happy curls.", tags: ["Treatment included"], rating: 4.8, reviewsCount: 14, gradient: "linear-gradient(135deg,#e0f2e9,#6b2148)", featured: false },
];

async function main() {
  const policy = await prisma.businessPolicy.findFirst({
    orderBy: { effectiveFrom: "desc" },
  });
  if (!policy) {
    const created = await prisma.businessPolicy.create({
      data: { depositPct: 50, cancelRetainPct: 50, rescheduleFeeKobo: 0, noshowFeeKobo: 0, noticeHours: 48, createdBy: "seed" },
    });
    await prisma.auditLog.create({
      data: { entity: "business_policy", entityId: created.id, newValue: JSON.parse(JSON.stringify(created)), changedBy: "seed", reason: "Phase 0 default policy" },
    });
    console.log("seeded business_policy:", created.id);
  } else {
    console.log("business_policy already seeded:", policy.id);
  }

  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: c });
  }
  for (const a of ADDONS) {
    await prisma.addon.upsert({ where: { name: a.name }, update: { priceKobo: a.priceKobo, description: a.description }, create: a });
  }
  for (const s of STYLES) {
    const category = await prisma.category.findUniqueOrThrow({ where: { name: s.cat } });
    await prisma.hairstyle.upsert({
      where: { slug: s.slug },
      update: { name: s.name, startingPriceKobo: s.price, description: s.description, tags: s.tags, rating: s.rating, reviewsCount: s.reviewsCount, badge: s.badge ?? null, gradient: s.gradient, featured: s.featured, active: true },
      create: { slug: s.slug, name: s.name, categoryId: category.id, startingPriceKobo: s.price, description: s.description, tags: s.tags, rating: s.rating, reviewsCount: s.reviewsCount, badge: s.badge, gradient: s.gradient, photos: [], featured: s.featured, active: true },
    });
  }
  const count = await prisma.hairstyle.count();
  console.log(`catalogue seeded: ${count} hairstyles`);

  const offers = [
    { title: "First-visit treat", description: "New to Hairven? Mention NEWHEAVEN during consultation for a first-visit treat.", code: "NEWHEAVEN", active: true },
    { title: "Refer a friend", description: "Bring a friend who books and completes a visit — you both earn 10 loyalty points.", code: "REFER", active: true },
  ];
  for (const o of offers) {
    const existing = await prisma.offer.findFirst({ where: { code: o.code } });
    if (!existing) await prisma.offer.create({ data: o });
  }
  console.log("offers seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
