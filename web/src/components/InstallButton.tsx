"use client";

import { useEffect, useState } from "react";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

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

// Visible install entry point. Android/Chrome shows the real install
// prompt; iPhone shows short Add-to-Home-Screen steps instead.
export function InstallButton({ compact = false }: { compact?: boolean }) {
  const [promptEvent, setPromptEvent] = useState<PromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
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

  if (installed) return null;

  const btn =
    "inline-flex items-center justify-center gap-1.5 rounded-full bg-plum-700 font-extrabold text-white hover:bg-plum-900";

  if (promptEvent) {
    return (
      <button
        type="button"
        onClick={async () => {
          await promptEvent.prompt();
          const { outcome } = await promptEvent.userChoice;
          if (outcome === "accepted") setPromptEvent(null);
        }}
        className={compact ? `${btn} px-4 py-2 text-sm` : `${btn} px-5 py-2.5 text-sm`}
      >
        <span aria-hidden>⬇</span> Install App
      </button>
    );
  }

  // No browser prompt available (iPhone, or desktop without PWA trigger):
  // one tap reveals 3-step instructions.
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setShowIosHelp((v) => !v)}
        className={compact ? `${btn} px-4 py-2 text-sm` : `${btn} px-5 py-2.5 text-sm`}
      >
        <span aria-hidden>⬇</span> Install App
      </button>
      {showIosHelp && (
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
    </span>
  );
}
