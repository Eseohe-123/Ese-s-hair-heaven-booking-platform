// Reusable loading placeholders. They mirror the real layout so the page
// feels like it is filling in rather than frozen on a blank screen.
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`rounded-xl bg-blush-100 motion-safe:animate-pulse ${className}`}
    />
  );
}

export function SkeletonHeading({ center = false }: { center?: boolean }) {
  return (
    <div className={center ? "mx-auto mb-8 max-w-2xl" : "mb-8 max-w-2xl"}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-9 w-2/3 max-w-sm" />
      <Skeleton className="mt-3 h-4 w-full" />
    </div>
  );
}

// Card grid that matches the hairstyle catalogue (photo + title + price + buttons).
export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[1.125rem] border border-blush-100 bg-white"
        >
          <Skeleton className="h-44 w-full rounded-none" />
          <div className="p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-6 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-4 h-4 w-1/2" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-full" />
              <Skeleton className="h-10 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple stacked rows for lists (bookings, payments, notifications).
export function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-blush-100 bg-white p-4"
        >
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Small stat tiles used on the dashboard and account pages.
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-blush-100 bg-white p-5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-3 h-8 w-12" />
        </div>
      ))}
    </div>
  );
}
