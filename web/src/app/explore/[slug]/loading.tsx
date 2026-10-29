import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10" role="status" aria-busy="true">
      <span className="sr-only">Loading style details…</span>
      <Skeleton className="h-4 w-32" />
      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-[1.5rem]" />
        <div>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-9 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-6 h-6 w-1/2" />
          <div className="mt-6 flex gap-2">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="h-12 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-10 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
