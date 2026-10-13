import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  m4v: "video/x-m4v",
  svg: "image/svg+xml",
};

// Serves user-uploaded media + the drop-in logo from disk at request time.
// (Next's static server only sees files present at boot; uploads land later.)
// Allowed roots: uploads/** and top-level logo.svg / logo.png.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  // Keep forward slashes for validation (normalize() would flip them to
  // backslashes on Windows and break the prefix checks below).
  const rel = path.join("/");
  if (rel.startsWith("..") || rel.split("/").includes("..")) {
    return NextResponse.json({ error: "Bad path" }, { status: 400 });
  }
  const isUpload = rel === "uploads" || rel.startsWith("uploads/");
  const isLogo = rel === "logo.svg" || rel === "logo.png";
  if (!isUpload && !isLogo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const full = join(process.cwd(), "public", ...rel.split("/"));
    const info = await stat(full);
    if (!info.isFile()) throw new Error("not-a-file");
    const ext = (rel.split(".").pop() ?? "").toLowerCase();
    const bytes = await readFile(full);
    // Use Uint8Array explicitly — avoids a TS DOM/Node Buffer typing clash.
    const body = new Uint8Array(bytes);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "Content-Length": String(body.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
