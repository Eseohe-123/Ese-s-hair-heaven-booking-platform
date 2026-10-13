"use client";

import { useActionState } from "react";
import { uploadStylePhoto } from "./actions";

const initialState: { ok: boolean; error: string } = { ok: false, error: "" };

export function PhotoUploadForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(uploadStylePhoto, initialState);
  return (
    <form action={formAction} className="mt-2 flex flex-col gap-2">
      <input type="hidden" name="slug" value={slug} />
      <input
        name="photo" type="file" accept="image/*" required
        className="w-full text-xs text-cocoa-700 file:mr-2 file:rounded-full file:border-0 file:bg-blush-500 file:px-3 file:py-1.5 file:text-xs file:font-extrabold file:text-white"
      />
      <button
        type="submit" disabled={pending}
        className="rounded-full bg-plum-700 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
      >
        {pending ? "Uploading..." : "Upload photo"}
      </button>
      {state.error && (
        <p className="rounded-xl bg-red-50 p-2 text-xs font-bold text-red-700">{state.error}</p>
      )}
    </form>
  );
}
