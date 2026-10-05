export type Category = "Braids" | "Wig & Frontal" | "Natural Hair" | "Locs";

export const CATEGORIES: Category[] = [
  "Braids",
  "Wig & Frontal",
  "Natural Hair",
  "Locs",
];

export interface Hairstyle {
  slug: string;
  name: string;
  category: Category;
  startingPrice: number; // naira
  description: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  badge?: "BESTSELLER" | "NEW" | "PROMO";
  gradient: string; // placeholder artwork until real photos land
  photo?: string; // real photo URL once uploaded in admin
  featured?: boolean;
}

// Phase 1 static seed — real services, photos and prices confirmed with Ese in Phase 2.
export const HAIRSTYLES: Hairstyle[] = [
  {
    slug: "boho-knotless-braids",
    name: "Boho Knotless Braids",
    category: "Braids",
    startingPrice: 35000,
    description:
      "Lightweight knotless braids with soft curly ends. Length, size and colour agreed in consultation.",
    tags: ["Long", "Medium", "Coloured", "+ Curls"],
    rating: 4.9,
    reviewsCount: 42,
    badge: "BESTSELLER",
    gradient: "linear-gradient(135deg,#fbcfe8,#f472a0)",
    featured: true,
  },
  {
    slug: "french-curls-braids",
    name: "French Curls Braids",
    category: "Braids",
    startingPrice: 30000,
    description:
      "Bouncy French-curl ends on neat braids. Extra fullness available as an add-on.",
    tags: ["Medium", "Long", "Extra fullness"],
    rating: 4.8,
    reviewsCount: 31,
    gradient: "linear-gradient(135deg,#f3dce7,#9a2b5e)",
    featured: true,
  },
  {
    slug: "frontal-wig-install",
    name: "Frontal Wig Install",
    category: "Wig & Frontal",
    startingPrice: 25000,
    description:
      "Melted frontal install with styling of your choice. Bring your wig or source it through Ese.",
    tags: ["Straight", "Curly", "Styling included"],
    rating: 4.9,
    reviewsCount: 27,
    badge: "NEW",
    gradient: "linear-gradient(135deg,#e3b93a,#9a2b5e)",
    featured: true,
  },
  {
    slug: "silk-press-natural",
    name: "Silk Press (Natural Hair)",
    category: "Natural Hair",
    startingPrice: 15000,
    description:
      "Gentle wash, treatment and silky press for natural hair. Wash & treatment add-on available.",
    tags: ["Shoulder length", "Long", "+ Treatment"],
    rating: 4.7,
    reviewsCount: 19,
    gradient: "linear-gradient(135deg,#fce7f3,#d4a017)",
    featured: true,
  },
  {
    slug: "goddess-locs",
    name: "Goddess Locs",
    category: "Locs",
    startingPrice: 32000,
    description:
      "Soft, textured locs with curly accents. Size and length customised to you.",
    tags: ["Medium", "Long", "Curly accents"],
    rating: 4.8,
    reviewsCount: 22,
    gradient: "linear-gradient(135deg,#9a2b5e,#471532)",
  },
  {
    slug: "stitch-cornrows",
    name: "Stitch Cornrows",
    category: "Braids",
    startingPrice: 12000,
    description:
      "Clean, precise stitch cornrows in the pattern you love. Accessories on request.",
    tags: ["Pattern of choice", "+ Accessories"],
    rating: 4.9,
    reviewsCount: 35,
    badge: "PROMO",
    gradient: "linear-gradient(135deg,#f472a0,#6b2148)",
  },
  {
    slug: "closure-sew-in",
    name: "Closure Sew-In",
    category: "Wig & Frontal",
    startingPrice: 28000,
    description:
      "Flat, natural-looking closure sew-in. Bundles supplied by you or by Ese.",
    tags: ["Straight", "Body wave"],
    rating: 4.7,
    reviewsCount: 16,
    gradient: "linear-gradient(135deg,#fbeedf,#e05286)",
  },
  {
    slug: "wash-and-twist-out",
    name: "Wash, Treat & Twist-Out",
    category: "Natural Hair",
    startingPrice: 10000,
    description:
      "Nourishing wash, deep treatment and defined twist-out for happy curls.",
    tags: ["Treatment included"],
    rating: 4.8,
    reviewsCount: 14,
    gradient: "linear-gradient(135deg,#e0f2e9,#6b2148)",
  },
];

export interface Review {
  name: string;
  style: string;
  rating: number;
  text: string;
}

export const REVIEWS: Review[] = [
  {
    name: "Adaeze",
    style: "Boho Knotless Braids",
    rating: 5,
    text: "My hair has never had so many compliments. Ese just understood the assignment.",
  },
  {
    name: "Teni",
    style: "Frontal Wig Install",
    rating: 5,
    text: "Booking was so easy and the price we agreed is the price I paid. No stories.",
  },
  {
    name: "Mariam",
    style: "Silk Press",
    rating: 5,
    text: "Warm, gentle, unrushed. My natural hair has never felt this soft.",
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "How do I book?",
    a: "Explore hairstyles or tell Ese what you want, then chat on WhatsApp for a free consultation. Once you agree on the style, price and time, you pay a 50% deposit to secure your slot.",
  },
  {
    q: "Are consultations free?",
    a: "Yes — online on WhatsApp or physical. The consultation is part of the request flow, not an extra step.",
  },
  {
    q: "Are prices fixed?",
    a: "Displayed prices are starting prices. Your final price is agreed in consultation based on length, size, colour, fullness, add-ons and extensions — before you pay anything.",
  },
  {
    q: "What is the cancellation policy?",
    a: "If you cancel, 50% of your deposit is refunded. Rescheduling needs at least 48 hours notice and a small fee. If Ese cancels, you get a 100% refund. The full policy is always shown before you pay.",
  },
  {
    q: "Can I bring my own extensions?",
    a: "Yes. Bring yours, or Ese can source quality extensions and materials for you — the cost is agreed upfront and added to your bill.",
  },
];

export const WHATSAPP_LINK = "https://wa.me/2340000000000";

export function formatNaira(koboOrNaira: number): string {
  return `₦${koboOrNaira.toLocaleString("en-NG")}`;
}
