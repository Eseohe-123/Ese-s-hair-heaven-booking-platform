import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

// Dev storage: local disk under public/uploads.
// Serverless (Netlify Functions) has read-only disk except /tmp, so uploads
// fall back there to keep booking working. Photos in /tmp don't persist and
// aren't web-accessible — swap this module for Cloudflare R2 (callers stay
// unchanged) for permanent photo storage.
const MAX_FILES = 4;
const MAX_BYTES = 5 * 1024 * 1024;

export async function saveUploads(code: string, files: File[]): Promise<string[]> {
  const saved: string[] = [];
  const valid = files
    .slice(0, MAX_FILES)
    .filter((f) => f.size > 0 && f.type.startsWith("image/") && f.size <= MAX_BYTES);
  if (valid.length === 0) return saved;

  let dir = join(process.cwd(), "public", "uploads", code);
  let publicDir = true;
  try {
    await mkdir(dir, { recursive: true });
  } catch {
    // Read-only disk (serverless) → temp dir keeps the request working.
    dir = join(tmpdir(), "hairven-uploads", code);
    await mkdir(dir, { recursive: true });
    publicDir = false;
  }
  for (const file of valid) {
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(join(dir, filename), bytes);
    if (publicDir) saved.push(`/uploads/${code}/${filename}`);
  }
  return saved;
}
