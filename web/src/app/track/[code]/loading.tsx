import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10" role="status" aria-busy="true">
      <span className="sr-only">Loading your booking…</span>
      <Skeleton className="mx-auto h-3 w-24" />
      <Skeleton className="mx-auto mt-3 h-9 w-2/3 max-w-sm" />
      <div className="mt-8 rounded-[1.5rem] border border-blush-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <div className="mt-8 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="mt-2 h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-12 flex-1 rounded-full" />
        <Skeleton className="h-12 w-32 rounded-full" />
      </div>
    </div>
  );
}
