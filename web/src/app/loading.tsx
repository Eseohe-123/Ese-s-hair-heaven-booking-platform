import { Skeleton, SkeletonCards, SkeletonHeading } from "@/components/Skeleton";

// Fallback shown while any page streams in. Keeps the screen alive during
// Vercel cold starts instead of flashing a blank white page.
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10" role="status" aria-busy="true">
      <span className="sr-only">Loading page…</span>
      <SkeletonHeading center />
      <div className="mb-8 flex justify-center gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
      <SkeletonCards count={3} />
    </div>
  );
}
