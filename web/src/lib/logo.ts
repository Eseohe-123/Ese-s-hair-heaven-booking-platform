import { existsSync } from "node:fs";
import { join } from "node:path";

// Logo slot: drop a file named `logo.svg` (or logo.png) into web/public/
// and the header + footer switch from the "H" monogram automatically.
// No code change needed.
const CANDIDATES = ["/logo.svg", "/logo.png"];

export function siteLogo(): string | null {
  const pub = join(process.cwd(), "public");
  for (const candidate of CANDIDATES) {
    if (existsSync(join(pub, candidate))) return candidate;
  }
  return null;
}
