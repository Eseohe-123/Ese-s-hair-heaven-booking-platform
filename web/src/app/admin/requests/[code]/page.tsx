import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { prisma } from "@/lib/prisma";
import { WHATSAPP_LINK } from "@/data/content";
import { formatKobo } from "@/lib/money";
import { updateRequestAdmin } from "@/app/request/actions";
import { createAgreement } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Request detail",
  robots: { index: false },
};

const inputCls =
  "mt-2 w-full rounded-2xl border-2 border-blush-100 bg-white px-4 py-3 text-sm outline-none focus:border-blush-500";

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const request = await prisma.styleRequest.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      hairstyle: true,
      consultation: true,
      priceAgreement: { include: { appointment: true } },
    },
  });
  if (!request) notFound();

  const waLink = `${WHATSAPP_LINK}?text=${encodeURIComponent(`Hello! About your Hairven request ${request.code}...`)}`;
  const policy = await prisma.businessPolicy.findFirst({ orderBy: { effectiveFrom: "desc" } });

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs font-extrabold tracking-[3px] text-blush-600">
        REQUEST {request.code} • {request.status.replace("_", " ").toUpperCase()}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-plum-700">
        {request.hairstyle?.name ?? request.customName ?? "Custom request"}
      </h1>

      <div className="mt-6 rounded-[1.5rem] border border-blush-100 bg-white p-6">
        <dl className="space-y-3 text-sm">
          <div><dt className="font-extrabold text-plum-700">Description</dt><dd className="text-cocoa-700">{request.description}</dd></div>
          {request.comboNotes && <div><dt className="font-extrabold text-plum-700">Combo notes</dt><dd className="text-cocoa-700">{request.comboNotes}</dd></div>}
          {request.hairDetails && <div><dt className="font-extrabold text-plum-700">Hair details</dt><dd className="text-cocoa-700">{request.hairDetails}</dd></div>}
          {request.specialRequests && <div><dt className="font-extrabold text-plum-700">Special requests</dt><dd className="text-cocoa-700">{request.specialRequests}</dd></div>}
          {request.preferredDate && <div><dt className="font-extrabold text-plum-700">Preferred time</dt><dd className="text-cocoa-700">{new Date(request.preferredDate).toLocaleString("en-NG")}</dd></div>}
          <div><dt className="font-extrabold text-plum-700">Consultation channel</dt><dd className="text-cocoa-700">{request.consultation?.channel === "physical" ? "Physical" : "WhatsApp (online)"}</dd></div>
        </dl>
        {request.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {request.photos.map((src) => (
              <img key={src} src={src} alt="Customer inspiration" className="aspect-square rounded-xl object-cover" />
            ))}
          </div>
        )}
        <div className="mt-4">
          <Button href={waLink} variant="dark">
            Open WhatsApp chat
          </Button>
        </div>
      </div>

      {request.priceAgreement ? (
        <div className="mt-6 rounded-[1.5rem] border-2 border-green-200 bg-green-50 p-6 text-sm">
          <p className="font-extrabold text-green-900">
            Agreement set — total {formatKobo(request.priceAgreement.finalPriceKobo)}, deposit{" "}
            {formatKobo(request.priceAgreement.depositKobo)}, balance {formatKobo(request.priceAgreement.balanceKobo)}
          </p>
          {request.priceAgreement.appointment && (
            <p className="mt-2">
              Appointment{" "}
              <a href={`/appointments/${request.priceAgreement.appointment.code}`} className="font-bold text-plum-700 underline">
                {request.priceAgreement.appointment.code}
              </a>{" "}
              • {request.priceAgreement.appointment.status.replace(/_/g, " ")}
            </p>
          )}
        </div>
      ) : (
        <form action={createAgreement} className="mt-6 rounded-[1.5rem] border border-blush-100 bg-white p-6">
          <input type="hidden" name="requestCode" value={request.code} />
          <h2 className="font-display text-xl font-semibold text-plum-700">
            Agree price &amp; time
          </h2>
          <p className="mt-1 text-xs text-cocoa-500">
            Policy now: {policy?.depositPct}% deposit • amounts in naira, stored as kobo.
            {request.hairstyle && ` Style starts from ₦${Math.round(request.hairstyle.startingPriceKobo / 100).toLocaleString("en-NG")}.`}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-extrabold text-plum-700">Base price ₦<input name="baseNaira" type="number" min={1} required defaultValue={request.hairstyle ? Math.round(request.hairstyle.startingPriceKobo / 100) : undefined} className={inputCls} /></label>
            <label className="block text-sm font-extrabold text-plum-700">Customisation ₦<input name="customNaira" type="number" min={0} defaultValue={0} className={inputCls} /></label>
            <label className="block text-sm font-extrabold text-plum-700">Extensions / materials ₦<input name="extensionsNaira" type="number" min={0} defaultValue={0} className={inputCls} /></label>
            <label className="block text-sm font-extrabold text-plum-700">Discount ₦<input name="discountNaira" type="number" min={0} defaultValue={0} className={inputCls} /></label>
            <label className="block text-sm font-extrabold text-plum-700 sm:col-span-2">Appointment date &amp; time<input name="datetime" type="datetime-local" required defaultValue={request.preferredDate ? new Date(request.preferredDate).toISOString().slice(0, 16) : undefined} className={inputCls} /></label>
            <label className="block text-sm font-extrabold text-plum-700 sm:col-span-2">Studio / location note<input name="location" placeholder="Studio address or TBC" className={inputCls} /></label>
            <label className="block text-sm font-extrabold text-plum-700 sm:col-span-2">Agreement notes<input name="notes" placeholder="Length, size, colour agreed..." className={inputCls} /></label>
          </div>
          <button type="submit" className="mt-4 w-full rounded-full bg-blush-500 px-6 py-3 text-sm font-extrabold text-white hover:bg-blush-600">
            Finalise agreement — customer can now pay deposit
          </button>
        </form>
      )}

      <form action={updateRequestAdmin} className="mt-6 rounded-[1.5rem] border border-blush-100 bg-white p-6">
        <input type="hidden" name="code" value={request.code} />
        <label className="block text-sm font-extrabold text-plum-700">
          Status
          <select name="status" defaultValue={request.status} className={inputCls}>
            <option value="submitted">Submitted</option>
            <option value="in_consultation">In consultation</option>
            <option value="agreed">Agreed (price + time set)</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="mt-4 block text-sm font-extrabold text-plum-700">
          Ese&apos;s notes (history kept per request)
          <textarea name="adminNotes" rows={3} defaultValue={request.adminNotes ?? ""} placeholder="Agreed length, colour, price discussed..." className={inputCls} />
        </label>
        <button type="submit" className="mt-4 w-full rounded-full bg-plum-700 px-6 py-3 text-sm font-extrabold text-white hover:bg-plum-900">
          Save update
        </button>
      </form>
    </div>
  );
}
