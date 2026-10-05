import type { ReactNode } from "react";

export function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker?: string;
  title: string;
  sub?: ReactNode;
}) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      {kicker && (
        <p className="mb-2 text-xs font-extrabold tracking-[3px] text-blush-600">
          {kicker}
        </p>
      )}
      <h2 className="font-display text-3xl font-semibold text-plum-700 sm:text-4xl">
        {title}
      </h2>
      {sub && <p className="mt-3 text-cocoa-500">{sub}</p>}
    </div>
  );
}
