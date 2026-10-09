"use client";

import { useEffect, useState } from "react";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "hairven-install-dismissed";
const DECLINE_COUNT_KEY = "hairven-install-declines";

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Slim banner above the header: "Your hair studio, one tap away."
// Android/Chrome fires the real install prompt; iPhone gets 3-step help.
export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<PromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(true); // hide until client check runs
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // storage unavailable — still show the banner
    }
    setDismissed(false);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as PromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  const install = async () => {
    if (!promptEvent) {
      setShowHelp((v) => !v);
      return;
    }
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setPromptEvent(null);
      return;
    }
    // Declined twice → stop asking (best UX). Dismiss stays permanent.
    try {
      const n = (Number(localStorage.getItem(DECLINE_COUNT_KEY)) || 0) + 1;
      localStorage.setItem(DECLINE_COUNT_KEY, String(n));
      if (n >= 2) {
        localStorage.setItem(DISMISS_KEY, "1");
        setDismissed(true);
        setPromptEvent(null);
      }
    } catch {
      // storage unavailable — leave the banner as-is
    }
  };

  return (
    <div className="relative border-b border-blush-100 bg-blush-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="pr-8">
          <p className="text-sm font-extrabold text-plum-700">
            Your hair studio, one tap away.
          </p>
          <p className="text-xs font-semibold text-cocoa-500">
            Add Hairven to your home screen for quick access.
          </p>
        </div>
        <div className="relative flex shrink-0 items-center">
          <button
            type="button"
            onClick={install}
            className="inline-flex items-center gap-1.5 rounded-full bg-plum-700 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(107,33,72,0.35)] hover:bg-plum-900"
          >
            <span aria-hidden>⬇</span> Install App
          </button>
          {showHelp && !promptEvent && (
            <span className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-blush-100 bg-white p-4 text-left text-xs font-semibold text-cocoa-700 shadow-xl">
              {isIos() ? (
                <>
                  <span className="mb-1 block font-extrabold text-plum-700">Install on iPhone:</span>
                  1. Tap <strong>Share</strong> (square with arrow) below.
                  <br />
                  2. Scroll and tap <strong>Add to Home Screen</strong>.
                  <br />
                  3. Tap <strong>Add</strong> — Hairven appears with your apps.
                </>
              ) : (
                <>
                  <span className="mb-1 block font-extrabold text-plum-700">Install Hairven:</span>
                  Look for the <strong>install icon</strong> at the right end of the
                  browser address bar, or open this page in <strong>Chrome on
                  Android</strong> → menu ⋮ → <strong>Add to Home screen</strong>.
                </>
              )}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install banner"
        className="absolute right-3 top-2.5 rounded-full px-2 py-0.5 text-sm font-extrabold text-cocoa-500 hover:bg-blush-100"
      >
        ✕
      </button>
    </div>
  );
}
