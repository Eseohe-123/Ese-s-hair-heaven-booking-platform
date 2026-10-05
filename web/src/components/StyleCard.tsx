import Link from "next/link";
import { formatNaira, type Hairstyle } from "@/data/content";
import { toggleFavourite } from "@/app/account/actions";
import { Stars } from "./Stars";
import { StylePhoto } from "./StylePhoto";

const badgeStyles: Record<string, string> = {
  BESTSELLER: "bg-[#FEF3C7] text-[#92400E]",
  NEW: "bg-blush-100 text-blush-700",
  PROMO: "bg-[#E0E7FF] text-[#3730A8]",
};

export function StyleCard({ style }: { style: Hairstyle }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[1.125rem] border border-blush-100 bg-white shadow-[0_10px_30px_rgba(107,33,72,0.12)]">
      <StylePhoto
        photo={style.photo}
        name={style.name}
        gradient={style.gradient}
        className="h-44 w-full text-2xl"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          {style.badge && (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${badgeStyles[style.badge]}`}
            >
              {style.badge}
            </span>
          )}
          <span className="text-xs font-bold text-cocoa-500">{style.category}</span>
        </div>
        <h3 className="font-display text-xl font-semibold text-plum-700">
          {style.name}
        </h3>
        <p className="mt-1 text-sm text-cocoa-500">{style.description}</p>
        <p className="mt-3 font-extrabold text-plum-700">
          Starting from {formatNaira(style.startingPrice)}{" "}
          <span className="text-xs font-semibold text-cocoa-500">
            • final price agreed before deposit
          </span>
        </p>
        <p className="mt-2 text-sm">
          <Stars value={style.rating} />{" "}
          <span className="font-bold">{style.rating}</span>{" "}
          <span className="text-cocoa-500">({style.reviewsCount})</span>
        </p>
        <div className="mt-4 flex gap-2 pt-1">
          <Link
            href={`/request?style=${style.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-plum-700 px-4 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-plum-900"
          >
            Request This Style
          </Link>
          <form action={toggleFavourite}>
            <input type="hidden" name="slug" value={style.slug} />
            <button
              type="submit"
              aria-label={`Save ${style.name} to favourites`}
              className="inline-flex items-center justify-center rounded-full border-2 border-blush-100 px-4 py-2.5 text-sm font-extrabold text-plum-700 transition-colors hover:border-blush-500"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
