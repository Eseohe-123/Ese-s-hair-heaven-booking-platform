import { Skeleton, SkeletonCards, SkeletonHeading } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10" role="status" aria-busy="true">
      <span className="sr-only">Loading hairstyles…</span>
      <SkeletonHeading center />
      <div className="mx-auto mb-4 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
        <Skeleton className="h-12 w-28 rounded-2xl" />
      </div>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <SkeletonCards count={6} />
    </div>
  );
}
