import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

// Dev storage: local disk under public/uploads.
// TODO (R2): swap this module for Cloudflare R2 presigned uploads; callers stay unchanged.
const MAX_FILES = 4;
const MAX_BYTES = 5 * 1024 * 1024;

export async function saveUploads(code: string, files: File[]): Promise<string[]> {
  const saved: string[] = [];
  const dir = join(process.cwd(), "public", "uploads", code);
  await mkdir(dir, { recursive: true });
  for (const file of files.slice(0, MAX_FILES)) {
    if (file.size === 0) continue;
    if (!file.type.startsWith("image/")) continue;
    if (file.size > MAX_BYTES) continue;
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(join(dir, filename), bytes);
    saved.push(`/uploads/${code}/${filename}`);
  }
  return saved;
}
