import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Offers & Promotions",
  description: "Occasional Hairven treats — never continuous.",
};

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const offers = await prisma.offer.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading
        kicker="TREATS, OCCASIONALLY"
        title="Offers & Promotions"
        sub="Promotions run occasionally rather than continuously. Mention the code in consultation."
      />
      <div className="space-y-4">
        {offers.map((o) => (
          <div key={o.id} className="rounded-[1.5rem] bg-plum-700 p-8 text-white">
            <p className="text-xs font-extrabold tracking-[3px] text-gold-400">
              {o.code ?? "IN CONSULTATION"}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{o.title}</h2>
            <p className="mt-2 text-white/80">{o.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/explore">Explore Hairstyles</Button>
        <Button href="/request" variant="dark">
          Tell Ese What I Want
        </Button>
      </div>
    </div>
  );
}
