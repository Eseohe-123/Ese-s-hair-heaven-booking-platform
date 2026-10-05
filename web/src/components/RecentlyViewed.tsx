"use client";

import { useEffect, useState } from "react";

type Seen = { slug: string; name: string; price: number; gradient: string };
const KEY = "hairven-recently-viewed";

export function TrackView({ item }: { item: Seen }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const list: Seen[] = raw ? JSON.parse(raw) : [];
      const next = [item, ...list.filter((s) => s.slug !== item.slug)].slice(0, 8);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // private mode etc. — recently viewed is a nicety, not a requirement
    }
  }, [item]);
  return null;
}

export function RecentRow() {
  const [items, setItems] = useState<Seen[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 pb-4">
      <h2 className="font-display text-2xl font-semibold text-plum-700">Recently viewed</h2>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {items.map((s) => (
          <a
            key={s.slug}
            href={`/explore/${s.slug}`}
            className="flex w-44 shrink-0 flex-col overflow-hidden rounded-2xl border border-blush-100 bg-white"
          >
            <span
              className="flex h-20 items-center justify-center text-lg font-extrabold text-white"
              style={{ background: s.gradient }}
            >
              {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
            <span className="p-2 text-xs font-extrabold text-plum-700">{s.name}</span>
            <span className="px-2 pb-2 text-xs text-cocoa-500">
              From ₦{s.price.toLocaleString("en-NG")}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
