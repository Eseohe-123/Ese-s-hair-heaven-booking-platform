import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { SignOutButton } from "@/components/SignOutButton";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatKobo } from "@/lib/money";

export const metadata: Metadata = { title: "My account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [requests, favourites, ledger] = await Promise.all([
    prisma.styleRequest.findMany({
      where: { userId: user.id },
      include: {
        hairstyle: true,
        priceAgreement: { include: { appointment: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.favourite.findMany({
      where: { userId: user.id },
      include: { hairstyle: { include: { category: true } } },
    }),
    prisma.loyaltyLedger.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const points = ledger.reduce((sum, e) => sum + e.points, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        kicker="MEMBERS"
        title={`Hello, ${user.name.split(" ")[0]}`}
        sub={`${points} loyalty points • member-only treats on the way.`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[1.5rem] border border-blush-100 bg-white p-6">
          <h2 className="font-display text-xl font-semibold text-plum-700">My bookings</h2>
          {requests.length === 0 ? (
            <p className="mt-2 text-sm text-cocoa-500">
              Nothing linked yet. Made a request as a guest? Open it via{" "}
              <Link href="/track" className="font-bold text-blush-600 underline">Track</Link>{" "}
              and tap “Save to my account”.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {requests.map((r) => (
                <li key={r.id} className="flex flex-wrap justify-between gap-2 border-b border-blush-100 pb-2">
                  <span>
                    <strong>{r.hairstyle?.name ?? r.customName ?? "Custom"}</strong>{" "}
                    <span className="text-cocoa-500">• {r.code} • {r.status.replace(/_/g, " ")}</span>
                  </span>
                  <span className="flex gap-3">
                    <Link href={`/track/${r.code}`} className="font-bold text-blush-600 underline">Track</Link>
                    {r.priceAgreement?.appointment && (
                      <Link href={`/appointments/${r.priceAgreement.appointment.code}`} className="font-bold text-plum-700 underline">
                        {r.priceAgreement.appointment.code}
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[1.5rem] border border-blush-100 bg-white p-6">
          <h2 className="font-display text-xl font-semibold text-plum-700">My favourites</h2>
          {favourites.length === 0 ? (
            <p className="mt-2 text-sm text-cocoa-500">
              Tap Save on any style to keep it here for future inspiration.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {favourites.map((f) => (
                <li key={f.id} className="border-b border-blush-100 pb-2">
                  <Link href={`/explore/${f.hairstyle.slug}`} className="font-bold text-plum-700 underline">
                    {f.hairstyle.name}
                  </Link>{" "}
                  <span className="text-cocoa-500">• {f.hairstyle.category.name}</span>
                </li>
              ))}
            </ul>
          )}
          <h2 className="mt-6 font-display text-xl font-semibold text-plum-700">Loyalty activity</h2>
          {ledger.length === 0 ? (
            <p className="mt-2 text-sm text-cocoa-500">
              Earn 1 point per ₦1,000 of completed visits. Points appear here.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {ledger.map((e) => (
                <li key={e.id} className="flex justify-between gap-2 border-b border-blush-100 pb-2">
                  <span className="text-cocoa-700">{e.reason}</span>
                  <span className={`font-extrabold ${e.points >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {e.points >= 0 ? "+" : ""}{e.points} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
          {ledger.length > 0 && (
            <p className="mt-2 text-sm">Balance: <strong>{points} points{points >= 100 ? ` (≈${formatKobo(points * 1000)} value at 1pt = ₦10)` : ""}</strong></p>
          )}
        </section>
      </div>

      <div className="mt-8 text-center">
        <SignOutButton />
      </div>
    </div>
  );
}
