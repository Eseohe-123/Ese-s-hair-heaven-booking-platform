import { Skeleton, SkeletonRows } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10" role="status" aria-busy="true">
      <span className="sr-only">Loading request…</span>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-32" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-blush-100 bg-white p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
        <SkeletonRows count={2} />
      </div>
    </div>
  );
}
