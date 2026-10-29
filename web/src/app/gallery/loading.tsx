import { Skeleton, SkeletonHeading } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10" role="status" aria-busy="true">
      <span className="sr-only">Loading gallery…</span>
      <SkeletonHeading center />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
