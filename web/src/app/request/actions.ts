"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateRequestCode } from "@/lib/requests";
import { saveUploads } from "@/lib/storage";

const STATUSES = ["submitted", "in_consultation", "agreed", "cancelled"] as const;

export async function createRequest(formData: FormData): Promise<void> {
  const hairstyleSlug = (formData.get("hairstyleSlug") as string) || "";
  const customName = ((formData.get("customName") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const comboNotes = ((formData.get("comboNotes") as string) || "").trim();
  const hairDetails = ((formData.get("hairDetails") as string) || "").trim();
  const specialRequests = ((formData.get("specialRequests") as string) || "").trim();
  const preferredRaw = (formData.get("preferredDate") as string) || "";
  const channel = (formData.get("channel") as string) || "whatsapp_online";
  const contact = ((formData.get("contact") as string) || "").trim();

  if (!description && !hairstyleSlug && !customName) {
    throw new Error("Describe what you want or pick a hairstyle.");
  }

  const hairstyle = hairstyleSlug
    ? await prisma.hairstyle.findUnique({ where: { slug: hairstyleSlug } })
    : null;

  const code = await generateRequestCode();
  const photos = await saveUploads(
    code,
    formData.getAll("photos").filter((f): f is File => f instanceof File),
  );

  const request = await prisma.styleRequest.create({
    data: {
      code,
      hairstyleId: hairstyle?.id,
      customName: customName || null,
      description:
        description ||
        `Request for ${hairstyle?.name ?? customName} (contact: ${contact || "—"})`,
      comboNotes: comboNotes || null,
      hairDetails: hairDetails || null,
      specialRequests: specialRequests
        ? `${specialRequests}\nContact: ${contact || "—"}`
        : contact
          ? `Contact: ${contact}`
          : null,
      preferredDate: preferredRaw ? new Date(preferredRaw) : null,
      photos,
      status: "submitted",
      consultation: {
        create: {
          channel: channel === "physical" ? "physical" : "whatsapp_online",
          status: "open",
        },
      },
    },
  });

  redirect(`/track/${request.code}`);
}

export async function updateRequestAdmin(formData: FormData): Promise<void> {
  // TODO Phase 7: gate behind owner/staff role. Local dev only for now.
  const code = formData.get("code") as string;
  const status = formData.get("status") as string;
  const adminNotes = ((formData.get("adminNotes") as string) || "").trim();
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    throw new Error("Invalid status");
  }
  await prisma.styleRequest.update({
    where: { code },
    data: { status, adminNotes: adminNotes || null },
  });
  redirect(`/admin/requests/${code}`);
}
