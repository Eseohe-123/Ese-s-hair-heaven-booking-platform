import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10" role="status" aria-busy="true">
      <span className="sr-only">Loading request form…</span>
      <Skeleton className="mx-auto h-3 w-24" />
      <Skeleton className="mx-auto mt-3 h-9 w-2/3 max-w-sm" />
      <Skeleton className="mx-auto mt-3 h-4 w-full max-w-md" />
      <div className="mt-8 rounded-[1.5rem] border border-blush-100 bg-white p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mb-5">
            <Skeleton className="mb-2 h-3 w-28" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ))}
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
