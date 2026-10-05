import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export async function generateRequestCode(): Promise<string> {
  return generateCode("EHH");
}

export async function generateAppointmentCode(): Promise<string> {
  return generateCode("APT");
}

async function generateCode(prefix: "EHH" | "APT"): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let suffix = "";
    for (let i = 0; i < 6; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
    const code = `${prefix}-${suffix}`;
    const exists =
      prefix === "EHH"
        ? await prisma.styleRequest.findUnique({ where: { code } })
        : await prisma.appointment.findUnique({ where: { code } });
    if (!exists) return code;
  }
  throw new Error("Could not generate a unique code");
}
