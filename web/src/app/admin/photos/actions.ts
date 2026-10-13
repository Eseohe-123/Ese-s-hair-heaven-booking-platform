"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveImage } from "@/lib/uploads";

// TODO Phase 7: gate behind owner/staff role. Local dev only.

export async function uploadStylePhoto(
  _prev: { ok: boolean; error: string },
  formData: FormData,
): Promise<{ ok: boolean; error: string }> {
  const slug = formData.get("slug") as string;
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: "Choose a photo first." };

  const style = await prisma.hairstyle.findUnique({ where: { slug } });
  if (!style) return { ok: false, error: "Style not found." };

  try {
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    // Stored in R2 when keys exist, else local disk — same URL pattern works either way.
    const url = await saveImage(`styles/${slug}.${ext}`, file);
    await prisma.hairstyle.update({ where: { slug }, data: { photos: [url] } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    if (file instanceof File) {
      console.error(
        `photo-upload-rejected name="${file.name}" type="${file.type}" size=${file.size}`,
      );
    }
    // Show the detected file details so a rejection is always diagnosable.
    const detected =
      file instanceof File
        ? ` (file arrived as type="${file.type || "none"}" name="${file.name}" size=${Math.round(file.size / 1024)}KB)`
        : "";
    // Friendly hint for the common phone cases.
    const hint = /only image files/i.test(message)
      ? " Tip: pick a JPG/PNG photo — videos and documents can't be used here."
      : "";
    return { ok: false, error: message + hint + detected };
  }
  redirect("/admin/photos");
}

export async function removeStylePhoto(formData: FormData): Promise<void> {
  const slug = formData.get("slug") as string;
  await prisma.hairstyle.update({ where: { slug }, data: { photos: [] } });
  redirect("/admin/photos");
}
