import { Skeleton, SkeletonHeading, SkeletonRows, SkeletonStats } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10" role="status" aria-busy="true">
      <span className="sr-only">Loading dashboard…</span>
      <SkeletonHeading />
      <SkeletonStats count={4} />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <Skeleton className="mb-3 h-6 w-40" />
          <SkeletonRows count={3} />
        </div>
        <div>
          <Skeleton className="mb-3 h-6 w-40" />
          <SkeletonRows count={3} />
        </div>
      </div>
    </div>
  );
}
