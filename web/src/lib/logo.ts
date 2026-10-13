import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

// Logo slot: drop a file named `logo.svg` (or logo.png) into web/public/
// and the header + footer switch from the "H" monogram automatically.
// Served via /api/media so it works even when added while running.
const CANDIDATES = ["logo.svg", "logo.png"];

export function siteLogo(): string | null {
  const pub = join(process.cwd(), "public");
  for (const candidate of CANDIDATES) {
    const full = join(pub, candidate);
    if (existsSync(full)) {
      // Version by file time so browsers drop the previous logo instantly.
      const v = Math.floor(statSync(full).mtimeMs / 1000);
      return `/api/media/${candidate}?v=${v}`;
    }
  }
  return null;
}
