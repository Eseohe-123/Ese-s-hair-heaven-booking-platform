"use server";

import { redirect } from "next/navigation";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";

// TODO Phase 7: gate behind owner/staff role. Local dev only.

export async function uploadStylePhoto(formData: FormData): Promise<void> {
  const slug = formData.get("slug") as string;
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose a photo first.");
  if (!file.type.startsWith("image/")) throw new Error("Only image files allowed.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Photo must be under 8MB.");

  const style = await prisma.hairstyle.findUnique({ where: { slug } });
  if (!style) throw new Error("Style not found.");

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const dir = join(process.cwd(), "public", "uploads", "styles");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${slug}.${ext}`), Buffer.from(await file.arrayBuffer()));

  await prisma.hairstyle.update({
    where: { slug },
    data: { photos: [`/uploads/styles/${slug}.${ext}`] },
  });
  redirect("/admin/photos");
}

export async function removeStylePhoto(formData: FormData): Promise<void> {
  const slug = formData.get("slug") as string;
  await prisma.hairstyle.update({ where: { slug }, data: { photos: [] } });
  redirect("/admin/photos");
}
