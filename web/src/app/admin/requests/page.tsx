import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Requests inbox",
  robots: { index: false },
};

const FILTERS = ["all", "submitted", "in_consultation", "agreed", "cancelled"];

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "all";
  const requests = await prisma.styleRequest.findMany({
    where: status === "all" ? {} : { status },
    include: { hairstyle: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        kicker="ESE'S SIDE • LOCAL DEV"
        title="Requests inbox"
        sub="Newest first. Open one to consult, update status and keep notes."
      />
      <p className="mb-6 text-center text-sm">
        <Link href="/admin/payments" className="font-bold text-blush-600 underline">
          Go to payments to verify →
        </Link>{" "}
        •{" "}
        <Link href="/admin/photos" className="font-bold text-blush-600 underline">
          Manage style photos →
        </Link>
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/requests" : `/admin/requests?status=${f}`}
            className={`rounded-full px-4 py-2 text-sm font-bold ${status === f ? "bg-plum-700 text-white" : "border-2 border-blush-100 bg-white text-cocoa-700"}`}
          >
            {f.replace("_", " ")}
          </Link>
        ))}
      </div>
      <div className="space-y-3">
        {requests.length === 0 && (
          <p className="rounded-2xl border border-blush-100 bg-white p-6 text-center text-cocoa-500">
            No requests here yet — new customer requests will land in this inbox.
          </p>
        )}
        {requests.map((r) => (
          <Link
            key={r.code}
            href={`/admin/requests/${r.code}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blush-100 bg-white p-4 hover:border-blush-500"
          >
            <div>
              <p className="font-extrabold text-plum-700">
                {r.code} — {r.hairstyle?.name ?? r.customName ?? "Custom request"}
              </p>
              <p className="line-clamp-1 text-sm text-cocoa-500">{r.description}</p>
              <p className="text-xs text-cocoa-500">
                {new Date(r.createdAt).toLocaleString("en-NG")}
                {r.photos.length > 0 && ` • ${r.photos.length} photo(s)`}
              </p>
            </div>
            <span className="rounded-full bg-blush-50 px-3 py-1 text-xs font-bold text-blush-700">
              {r.status.replace("_", " ")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
