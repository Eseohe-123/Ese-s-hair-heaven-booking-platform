"use client";

import { useEffect, useState } from "react";

// Registers /sw.js and surfaces a "new version" prompt when a fresh build
// has installed. Without this, people can sit on a cached build for days
// (which is how stale logos and missing buttons happen).
export function SwRegister() {
  const [updateReady, setUpdateReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Register once and watch for a waiting worker.
  useEffect(() => {
    if (!("serviceWorker" in navigator) || window.location.protocol !== "https:") {
      return;
    }

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => reg?.update())
        .catch(() => {
          // offline support is a nicety, not a requirement
        });
    };

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          setUpdateReady(true);
        }
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        });
      })
      .catch(() => {
        // private mode / unsupported browser: the app still works
      });

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Reload once the new worker actually takes control.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let reloaded = false;
    const onChange = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onChange);
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) {
        reg.waiting.postMessage("SKIP_WAITING");
      } else {
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  };

  if (!updateReady) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-blush-100 bg-white p-4 shadow-[0_12px_30px_rgba(107,33,72,0.25)]"
    >
      <p className="text-sm font-extrabold text-plum-700">A new Hairven is ready</p>
      <p className="mt-1 text-xs font-semibold text-cocoa-500">
        Refresh to see the latest styles, prices and fixes.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="rounded-full bg-blush-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-blush-600 disabled:opacity-60"
        >
          {refreshing ? "Refreshing…" : "Refresh now"}
        </button>
        <button
          type="button"
          onClick={() => setUpdateReady(false)}
          className="rounded-full px-3 py-2 text-xs font-extrabold text-cocoa-500 hover:bg-blush-50"
        >
          Later
        </button>
      </div>
    </div>
  );
}
