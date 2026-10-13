import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hairven — Everything Hair",
    short_name: "Hairven",
    description:
      "Explore hairstyles, consult free, book your appointment. Classy • Cute • Unique.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF7F0",
    theme_color: "#6B2148",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
