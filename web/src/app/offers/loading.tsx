import { Skeleton, SkeletonHeading } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10" role="status" aria-busy="true">
      <span className="sr-only">Loading offers…</span>
      <SkeletonHeading center />
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[1.5rem] border border-blush-100 bg-white p-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-5 h-10 w-32 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
