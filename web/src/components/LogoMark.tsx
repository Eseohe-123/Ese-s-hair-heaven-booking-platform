"use client";

import { useEffect, useState } from "react";

// Renders the "H" monogram, then swaps to the real logo the moment
// a logo.svg / logo.png appears in web/public. Works on cached pages.
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  const [logo, setLogo] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/logo")
      .then((r) => r.json())
      .then((d) => {
        if (d.logo) setLogo(d.logo);
      })
      .catch(() => {
        // logo check is a nicety — monogram stays on failure
      });
  }, []);
  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt="Hairven logo" className={`${className} rounded-full object-cover`} />;
  }
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blush-500 to-plum-700 font-display text-lg font-bold text-white ${className}`}
    >
      H
    </span>
  );
}
