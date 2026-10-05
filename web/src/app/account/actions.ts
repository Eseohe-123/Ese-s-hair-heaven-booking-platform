"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function toggleFavourite(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  const slug = formData.get("slug") as string;
  if (!user) redirect(`/login?next=/explore/${slug}`);
  const hairstyle = await prisma.hairstyle.findUnique({ where: { slug } });
  if (!hairstyle) throw new Error("Style not found.");
  const existing = await prisma.favourite.findUnique({
    where: { userId_hairstyleId: { userId: user.id, hairstyleId: hairstyle.id } },
  });
  if (existing) {
    await prisma.favourite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favourite.create({ data: { userId: user.id, hairstyleId: hairstyle.id } });
  }
  redirect(`/explore/${slug}`);
}

export async function claimRequest(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  const code = (formData.get("code") as string).toUpperCase();
  if (!user) redirect(`/login?next=/track/${code}`);
  await prisma.styleRequest.updateMany({
    where: { code, userId: null },
    data: { userId: user.id },
  });
  redirect("/account");
}
