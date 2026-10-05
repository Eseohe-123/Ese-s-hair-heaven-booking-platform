import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Stars } from "@/components/Stars";
import { prisma } from "@/lib/prisma";
import { moderateReview } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Review moderation",
  robots: { index: false },
};

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const withStyle = await Promise.all(
    reviews.map(async (r) => {
      const appointment = await prisma.appointment.findUnique({
        where: { id: r.appointmentId },
        include: { request: { include: { hairstyle: true } } },
      });
      return { ...r, styleName: appointment?.request.hairstyle?.name ?? appointment?.request.customName ?? "Custom" };
    }),
  );

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <SectionHeading
        kicker="ESE'S SIDE • TRUST"
        title="Reviews"
        sub="Approve to publish in Customer Looks. Only approved reviews with permission are featured."
      />
      <div className="space-y-3">
        {withStyle.length === 0 && (
          <p className="rounded-2xl border border-blush-100 bg-white p-6 text-center text-cocoa-500">
            No reviews yet — customers are prompted after completed visits.
          </p>
        )}
        {withStyle.map((r) => (
          <div key={r.id} className="rounded-2xl border border-blush-100 bg-white p-5">
            <p><Stars value={r.rating} /> <span className="text-sm font-bold">{r.styleName}</span></p>
            {r.text && <p className="mt-2 text-sm text-cocoa-700">“{r.text}”</p>}
            <p className="mt-1 text-xs text-cocoa-500">
              {new Date(r.createdAt).toLocaleString("en-NG")} • feature permission: {r.permissionToFeature ? "yes" : "no"} • {r.status}
            </p>
            {r.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <form action={moderateReview}>
                  <input type="hidden" name="reviewId" value={r.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" className="rounded-full bg-green-700 px-4 py-2 text-xs font-extrabold text-white">Approve</button>
                </form>
                <form action={moderateReview}>
                  <input type="hidden" name="reviewId" value={r.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button type="submit" className="rounded-full border-2 border-red-200 px-4 py-2 text-xs font-extrabold text-red-700">Reject</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
