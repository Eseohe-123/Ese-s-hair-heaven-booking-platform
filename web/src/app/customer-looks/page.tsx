import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Stars } from "@/components/Stars";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Customer Looks",
  description: "Real Hairven customers, finished styles and reviews — shared with permission.",
};

// Reviews land after visits complete — always render fresh.
export const dynamic = "force-dynamic";

export default async function CustomerLooksPage() {
  const reviews = await prisma.review.findMany({
    where: { status: "approved", permissionToFeature: true },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
  const withStyle = await Promise.all(
    reviews.map(async (r) => {
      const appointment = await prisma.appointment.findUnique({
        where: { id: r.appointmentId },
        include: { request: { include: { hairstyle: true } } },
      });
      return {
        ...r,
        styleName: appointment?.request.hairstyle?.name ?? appointment?.request.customName ?? "Custom style",
      };
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        kicker="REAL CUSTOMERS"
        title="Customer Looks"
        sub="Finished styles and honest reviews — published with permission. Yours could be here after your visit."
      />
      {withStyle.length === 0 ? (
        <p className="mx-auto max-w-xl rounded-[1.5rem] border border-blush-100 bg-white p-10 text-center text-cocoa-500">
          The first looks are on their way. After your visit you&apos;ll be
          invited to leave a rating — approved reviews with your permission
          appear here.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {withStyle.map((r) => (
            <figure key={r.id} className="rounded-2xl border border-blush-100 bg-white p-6">
              <Stars value={r.rating} />
              {r.text && <blockquote className="mt-3 text-cocoa-700">“{r.text}”</blockquote>}
              <figcaption className="mt-4 text-sm font-extrabold text-plum-700">
                {r.styleName}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
