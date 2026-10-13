import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import convert from "heic-convert";

// Unified image uploads: Cloudflare R2 when keys are configured,
// local disk (public/uploads) otherwise. Callers stay unchanged.

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const VIDEO_EXTS = ["mp4", "mov", "webm", "m4v"];

export function isVideoUrl(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTS.some((ext) => clean.endsWith(`.${ext}`));
}

function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_URL,
  );
}

export function storageBackend(): "r2" | "local" {
  return r2Configured() ? "r2" : "local";
}

function cleanExt(filename: string): string {
  return (filename.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
}

export function validImage(file: File, maxBytes = MAX_IMAGE_BYTES): string | null {
  if (file.size === 0) return "empty file";
  // Reject only files that positively identify as non-images (videos, PDFs...).
  // Anything else gets a second chance via content sniffing after upload.
  if (
    file.type !== "" &&
    file.type !== "application/octet-stream" &&
    !file.type.startsWith("image/")
  ) {
    return "only image files allowed (JPG, PNG, WebP, HEIC)";
  }
  if (file.size > maxBytes) return `image must be under ${Math.round(maxBytes / 1024 / 1024)}MB`;
  return null;
}

// Phones (especially iPhones) sometimes send photos as application/octet-stream.
// Trust the file extension in that case; convert HEIC/HEIF to JPEG since
// browsers cannot display them.
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "heic", "heif"];

function extOf(filename: string): string {
  return (filename.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Reads the file's magic bytes — catches real photos saved without an
// extension (e.g. WhatsApp Web downloads like "...8.44.52 AM").
function sniffImageExt(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "gif";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (bytes.toString("ascii", 4, 8) === "ftyp") {
    const brand = bytes.toString("ascii", 8, 12);
    if (["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1"].includes(brand)) return "heic";
  }
  return null;
}

// Returns web-ready bytes: HEIC/HEIF converted to JPEG, everything else kept.
// Extension comes from the filename when valid, otherwise from content sniffing.
async function normalizeImageBytes(file: File): Promise<{ bytes: Buffer; ext: string; mime: string }> {
  const raw = Buffer.from(await file.arrayBuffer());
  const named = extOf(file.name);
  const sniffed = sniffImageExt(raw);
  let ext = IMAGE_EXTS.includes(named) ? named : sniffed;
  if (!ext) {
    throw new Error(
      `only image files allowed (JPG, PNG, WebP, HEIC) — this file isn't a recognised photo (type="${file.type || "none"}")`,
    );
  }
  let mime = file.type.startsWith("image/") ? file.type : `image/${ext === "jpg" ? "jpeg" : ext}`;
  if (ext === "heic" || ext === "heif") {
    const converted = await convert({ buffer: raw, format: "JPEG", quality: 0.85 });
    return { bytes: Buffer.from(converted), ext: "jpg", mime: "image/jpeg" };
  }
  if (!["jpg", "jpeg", "png", "webp"].includes(ext)) ext = "jpg";
  if (mime === "application/octet-stream") mime = "image/jpeg";
  return { bytes: raw, ext, mime };
}

async function saveLocal(key: string, bytes: Buffer): Promise<string> {
  const full = join(process.cwd(), "public", "uploads", key);
  await mkdir(join(full, ".."), { recursive: true });
  await writeFile(full, bytes);
  // Served via /api/media (Next only sees files present at boot).
  return `/api/media/uploads/${key}`;
}

async function saveR2(key: string, bytes: Buffer, contentType: string): Promise<string> {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: bytes,
      ContentType: contentType,
    }),
  );
  return `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
}

// Save one image under `key` (e.g. "styles/boho.png"). Returns its public URL.
export async function saveImage(key: string, file: File): Promise<string> {
  const problem = validImage(file);
  if (problem) throw new Error(problem);
  const { bytes, ext, mime } = await normalizeImageBytes(file);
  const finalKey = key.replace(/\.[a-z0-9]+$/i, `.${ext}`);
  if (r2Configured()) return saveR2(finalKey, bytes, mime);
  return saveLocal(finalKey, bytes);
}

// Save up to `max` images under `prefix/filename`, skipping invalid ones.
export async function saveImages(
  prefix: string,
  files: File[],
  opts?: { max?: number; maxBytes?: number; prefixFilenames?: (file: File, index: number) => string },
): Promise<string[]> {
  const max = opts?.max ?? 4;
  const saved: string[] = [];
  let index = 0;
  for (const file of files.slice(0, max)) {
    if (file.size === 0) continue;
    if (file.size > (opts?.maxBytes ?? MAX_IMAGE_BYTES)) continue;
    let prepared: { bytes: Buffer; ext: string; mime: string };
    try {
      prepared = await normalizeImageBytes(file);
    } catch {
      continue; // not a recognisable photo — skip it
    }
    const { bytes, ext, mime } = prepared;
    const rawName =
      opts?.prefixFilenames?.(file, index) ?? `${Date.now()}-${index}.${ext}`;
    const filename = rawName.replace(/\.[a-z0-9]+$/i, `.${ext}`);
    index++;
    if (r2Configured()) {
      saved.push(await saveR2(`${prefix}/${filename}`, bytes, mime));
    } else {
      saved.push(await saveLocal(`${prefix}/${filename}`, bytes));
    }
  }
  return saved;
}
