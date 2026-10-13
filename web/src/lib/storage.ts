import { randomUUID } from "node:crypto";
import { saveImages } from "./uploads";

// Request inspiration uploads: R2 when configured, else local disk.
// TODO (done): callers unchanged — backend switches on R2_* env vars.
const MAX_FILES = 4;
const MAX_BYTES = 10 * 1024 * 1024;

export async function saveUploads(code: string, files: File[]): Promise<string[]> {
  return saveImages(`requests/${code}`, files, {
    max: MAX_FILES,
    maxBytes: MAX_BYTES,
    prefixFilenames: (file) => `${randomUUID()}.${(file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"}`,
  });
}
