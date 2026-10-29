import type { NextConfig } from "next";

// Admin uploads can live in Cloudflare R2 when it is configured. Only the
// public bucket host is allowed through the image optimizer.
const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  { protocol: "https", hostname: "**.r2.dev" },
];

const r2PublicUrl = process.env.R2_PUBLIC_URL;
if (r2PublicUrl) {
  try {
    remotePatterns.push({ protocol: "https", hostname: new URL(r2PublicUrl).hostname });
  } catch {
    // ignore malformed URLs; local uploads keep working
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
