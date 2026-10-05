import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { prisma } from "@/lib/prisma";
import { WHATSAPP_LINK, formatNaira } from "@/data/content";
import { claimRequest } from "@/app/account/actions";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Track my request" };

const STATUS_COPY: Record<string, string> = {
  submitted: "Received — Ese will pick it up for consultation shortly.",
  in_consultation: "In consultation — chat with Ese to agree style, price and time.",
  agreed: "Agreed — your price and time are set. Deposit secures your slot (Phase 3).",
  cancelled: "Cancelled — contact Ese if this was a mistake.",
};

export default async function TrackRequestPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const request = await prisma.styleRequest.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      hairstyle: { include: { category: true } },
      priceAgreement: { include: { appointment: true } },
    },
  });
  if (!request) notFound();
  const appointment = request.priceAgreement?.appointment;
  const sessionUser = await getSessionUser();

  const summary = `${request.hairstyle ? request.hairstyle.name : request.customName ?? "Custom request"} (${request.code})`;
  const waLink = `${WHATSAPP_LINK}?text=${encodeURIComponent(`Hello Ese! My Hairven request is ${request.code}: ${summary}. ${request.description}`)}`;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading
        kicker={`REQUEST ${request.code}`}
        title={request.hairstyle?.name ?? request.customName ?? "Custom request"}
        sub={STATUS_COPY[request.status] ?? request.status}
      />
      <div className="rounded-[1.5rem] border border-blush-100 bg-white p-6 sm:p-8">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="font-extrabold text-plum-700">Status</dt>
            <dd className="rounded-full bg-blush-50 px-3 py-1 font-bold text-blush-700">
              {request.status.replace("_", " ")}
            </dd>
          </div>
          {request.hairstyle && (
            <div className="flex justify-between gap-4">
              <dt className="font-extrabold text-plum-700">Starting from</dt>
              <dd>{formatNaira(Math.round(request.hairstyle.startingPriceKobo / 100))}</dd>
            </div>
          )}
          <div>
            <dt className="font-extrabold text-plum-700">Your description</dt>
            <dd className="mt-1 text-cocoa-700">{request.description}</dd>
          </div>
          {request.comboNotes && (
            <div>
              <dt className="font-extrabold text-plum-700">Photo combo</dt>
              <dd className="mt-1 text-cocoa-700">{request.comboNotes}</dd>
            </div>
          )}
          {request.preferredDate && (
            <div className="flex justify-between gap-4">
              <dt className="font-extrabold text-plum-700">Preferred time</dt>
              <dd>{new Date(request.preferredDate).toLocaleString("en-NG")}</dd>
            </div>
          )}
        </dl>
        {request.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {request.photos.map((src) => (
              <img key={src} src={src} alt="Inspiration photo" className="aspect-square rounded-xl object-cover" />
            ))}
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {appointment && (
            <Button href={`/appointments/${appointment.code}`}>
              View appointment &amp; pay deposit
            </Button>
          )}
          <Button href={waLink} variant="dark">
            Continue on WhatsApp
          </Button>
          <Button href="/explore" variant="outline">
            Keep exploring
          </Button>
        </div>
        <p className="mt-4 text-xs text-cocoa-500">
          Save your code <strong>{request.code}</strong> — use it to track this
          request or mention it to Ese. Look it up anytime at /track.
        </p>
        {sessionUser && !request.userId && (
          <form action={claimRequest} className="mt-3">
            <input type="hidden" name="code" value={request.code} />
            <button type="submit" className="text-sm font-bold text-blush-600 underline">
              Save to my account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
