import { Skeleton, SkeletonHeading, SkeletonRows, SkeletonStats } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10" role="status" aria-busy="true">
      <span className="sr-only">Loading your account…</span>
      <div className="mb-8 flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
      </div>
      <SkeletonStats count={3} />
      <div className="mt-8">
        <SkeletonHeading />
        <SkeletonRows count={3} />
      </div>
    </div>
  );
}
