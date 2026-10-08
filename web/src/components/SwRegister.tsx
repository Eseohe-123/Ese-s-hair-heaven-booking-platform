"use client";

import { useEffect } from "react";

// Registers /sw.js once. Silent if unsupported — the app works fine without it.
export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.location.protocol === "https:") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // offline support is a nicety, not a requirement
      });
    }
  }, []);
  return null;
}
